import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
    await resend.emails.send({
        from: 'onboarding@resend.dev',  // Free default sender
        to: email,
        subject: 'Your OTP - Rope Pro Academy',
        html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your Verification Code</h2>
        <p style="font-size: 16px;">Your OTP is:</p>
        <h1 style="background: #f4f4f5; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    });
}
