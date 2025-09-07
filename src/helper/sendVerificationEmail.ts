import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
  try {
    const {data, error} = await resend.emails.send({
      from: 'no-reply@amit.production.com',
      to: [email.toString()],
      subject: 'Anonymous-Feed | Verification code',
      react: VerificationEmail({username, otp: verifyCode}),
    });

    console.log(data)

    if (error) {
      console.log("Email Error :: ", error);
      return {
        success: false,
        message: "Failed to send verification email"
      }
    }

    return {
      success: true,
      message: "Verification email sent successfully",
    }
  } catch (emailError) {
    console.error("Email Error :: ", emailError);
    return {
      success: false,
      message: "Failed to send verification email"
    }
  }
}