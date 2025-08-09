import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";
import { User as NextAuthUser } from "next-auth";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect()

  try {
    const {acceptMessages} = await req.json()
    const session = await getServerSession(authOptions)
    const user: NextAuthUser = session?.user as NextAuthUser

    if (!session || !session.user) {
      console.log("User not authenticated");
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id)

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { isAcceptingMessage: acceptMessages },
      { new: true }
    )

    if (!updatedUser) {
      console.log("User not found");
      return Response.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Messages acceptance status updated successfully", updatedUser }, { status: 200 })
    
  } catch (error) {
    console.log("Error accepting messages :: ", error);
    return Response.json({ success: false, message: "Failed to accept messages" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  await dbConnect()

  try {
    const session = await getServerSession(authOptions)
    const user: NextAuthUser = session?.user as NextAuthUser

    console.log(session, user)

    if (!session || !session.user) {
      console.log("User not authenticated");
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id)

    const updatedUser = await User.findById(userId)

    if (!updatedUser) {
      console.log("User not found");
      return Response.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Messages acceptance status fetched successfully", isAcceptingMessages: updatedUser.isAcceptingMessage }, { status: 200 })
  } catch (error) {
    console.log("Error to fetching acceptance status of messages :: ", error);
    return Response.json({ success: false, message: "Failed to fetch acceptance status of messages" }, { status: 500 })
  }
}