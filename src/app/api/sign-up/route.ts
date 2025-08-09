import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User.model";
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await req.json();
    const existingUserVerifiedByUsername = await User.findOne({ username, isVerified: true })

    if (existingUserVerifiedByUsername) {
      return Response.json({
        success: false,
        message: "Username is already taken"
      }, { status: 400 })
    }

    const existingUserByEmail = await User.findOne({ email })
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json({
          success: false,
          message: "Email is already taken"
        }, { status: 400 })
      } else {
        const hashedPassword = bcrypt.hashSync(password, 10)
        existingUserByEmail.password = hashedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiration = new Date(Date.now() + 3600000)

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = bcrypt.hashSync(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiration: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
      })

      await newUser.save();
    }

    //Send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode)

    if (!emailResponse.success) {
      console.log("Error sending verification email :: ", emailResponse.message);
      return Response.json({
        success: false,
        message: emailResponse.message
      }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: "User registered successfully"
    }, { status: 200 })

  } catch (error) {
    console.log("Error registering user :: ", error);
    return Response.json({
      success: false,
      message: "Error registering user"
    }, { status: 500 })
  }
}