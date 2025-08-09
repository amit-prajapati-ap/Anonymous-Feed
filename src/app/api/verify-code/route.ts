import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";

export async function POST(req: Request) {
  await dbConnect()

  try {
    const {username, code} = await req.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await User.findOne({username: decodedUsername})

    if (!user) {
      return Response.json({success: false, message: "User not found"}, {status: 404})
    }

    const isCodeValid = user.verifyCode === code
    const isCodeExpired = new Date() > user.verifyCodeExpiration

    if (isCodeValid && !isCodeExpired) {
      user.isVerified = true
      await user.save()
      return Response.json({success: true, message: "Account verified successfully"}, {status: 200})
    } else if(!isCodeValid) {
      return Response.json({success: false, message: "Verification code is invalid"}, {status: 400})
    } else if(isCodeExpired) {
      return Response.json({success: false, message: "Verification code has expired"}, {status: 400})
    }
  } catch (error) {
    console.log("Error verifying code :: ", error);
    return Response.json({success: false, message: "Failed to verify code"}, {status: 500})
  }
}