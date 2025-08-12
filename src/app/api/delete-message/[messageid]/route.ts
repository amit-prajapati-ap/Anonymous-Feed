import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";
import { User as NextAuthUser } from "next-auth";

export async function DELETE(req: Request, {params}: {params: {messageid: string}}) {
  const messageId = params.messageid
  await dbConnect()

  try {
    const session = await getServerSession(authOptions)
    const user: NextAuthUser = session?.user as NextAuthUser

    console.log(session, user)

    if (!session || !session.user) {
      console.log("User not authenticated");
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const updateResult = await User.updateOne({_id: user._id}, {$pull: {messages: {_id: messageId}}})

    if (updateResult.modifiedCount === 0) {
      return Response.json({ success: false, message: "Message not found or already deleted" }, { status: 400 })
    }

    return Response.json({ success: true, message: "Message deleted successfully" }, { status: 200 })
    
  } catch (error) {
    console.log("Error to deleting message :: ", error);
    return Response.json({ success: false, message: "Failed to delete message" }, { status: 500 })
  }
}