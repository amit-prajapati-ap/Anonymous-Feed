import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";
import { User as NextAuthUser } from "next-auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user: NextAuthUser = session?.user as NextAuthUser;

    if (!session || !session.user) {
      console.log("User not authenticated");
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const userMessages = await User.aggregate([
      {
        $match: { _id: userId }
      },
      {
        $unwind: "$messages"
      },
      {
        $sort: { "messages.createdAt": -1 }
      },
      {
        $group: { _id: "$_id", messages: { $push: "$messages" }}
      }
    ])

    if (!userMessages || userMessages.length === 0) {
      console.log("User not found");
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    } 

    console.log(userMessages)

    return Response.json({ success: true, message: "Messages fetched successfully", messages: userMessages[0].messages }, { status: 200 });

  } catch (error) {
    console.log("Error fetching messages :: ", error);
    return Response.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
  }
}