import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";
import { Message } from "@/model/User.model";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {username, content} = await req.json();
    console.log(username, content)

    const user = await User.findOne({username});

    if (!user) {
      console.log("User not found");
      return Response.json({success: false, message: "User not found"}, {status: 404})
    }

    if (!user.isAcceptingMessage) {
      console.log("User is not accepting messages");
      return Response.json({success: false, message: "User is not accepting messages"}, {status: 400})
    }

    if (content.trim().length <= 20) {
      console.log("Message should be minimum 20 characters");
      return Response.json({success: false, message: "Message should be minimum 20 characters"}, {status: 400})      
    }

    if (content.trim().length > 300) {
      console.log("Message should be maximum 300 characters");
      return Response.json({success: false, message: "Message should be maximum 300 characters"}, {status: 400})   
    }

    const newMessage = {
      content,
      createdAt: new Date()
    }

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json({success: true, message: "Message sent successfully"}, {status: 200})
  } catch (error) {
    console.log("Error sending message :: ", error);
    return Response.json({success: false, message: "Failed to send message"}, {status: 500})
  }
}