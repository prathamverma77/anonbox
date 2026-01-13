// import {resend} from "@/lib/resend";

// import VerificationEmail from "../../emails/VerificationEmail";
// import { ApiResponse } from "@/types/ApiResponse";
// import { string } from "zod";

// export async function sendVerificationEmail(
//     email: string,
//     username: string,
//     verifyCode: string
// ) : Promise<ApiResponse>{
//     try{
//         await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: email,
//             subject: 'Anonbox | Verification code',
//             react: VerificationEmail({username, otp: verifyCode}),
//         });
//         return {success: true, message: 'Verification email send successfully'}
//     } catch (emailError) {
//         console.error("Error sendign verification email",emailError)
//         return{success: false, message: 'Failed to send verification email'}
//     }
// }
import { transporter } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        console.log('🔍 Sending verification email to:', email);
        console.log('🔑 Verification code:', verifyCode);
        
        await transporter.sendMail({
            from: `"AnonBox" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'AnonBox | Verification Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: white; font-size: 28px;">AnonBox</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">Welcome, ${username}! 👋</h2>
                                            <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 1.6;">
                                                Thank you for signing up! To complete your registration, please use the verification code below:
                                            </p>
                                            
                                            <!-- Verification Code Box -->
                                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                                <tr>
                                                    <td style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px; border: 2px dashed #667eea;">
                                                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                                        <p style="margin: 0; color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                            ${verifyCode}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="margin: 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                                                ⏰ This code will expire in <strong>1 hour</strong>.
                                            </p>
                                            <p style="margin: 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                                                If you didn't request this code, please ignore this email.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px 40px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                            <p style="margin: 0; color: #999; font-size: 12px;">
                                                © 2025 AnonBox. All rights reserved.
                                            </p>
                                            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                                                Anonymous messaging, made simple.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
            // Plain text fallback
            text: `Welcome to AnonBox, ${username}!
            
Your verification code is: ${verifyCode}

This code will expire in 1 hour.

If you didn't request this code, please ignore this email.

© 2025 AnonBox`,
        });
        
        console.log('✅ Verification email sent successfully to:', email);
        return { success: true, message: 'Verification email sent successfully' };
    } catch (emailError) {
        console.error("❌ Error sending verification email:", emailError);
        return { success: false, message: 'Failed to send verification email' };
    }
}