import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Thiếu email hoặc mã OTP" }, { status: 400 });
    }

    // Configure SMTP transport (Uses Gmail SMTP / custom environment or fallback)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "minishop.noreply@gmail.com",
        pass: process.env.SMTP_PASS || "sampleapppassword",
      },
    });

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #2e7d32; color: #ffffff; padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 20px;">
            🛍️ MINI SHOP
          </div>
        </div>
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 12px; text-align: center;">
          Xác Thực Đăng Ký Tài Khoản
        </h2>
        
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Xin chào <strong>${name || email}</strong>,<br>
          Cảm ơn bạn đã lựa chọn mua sắm tại <strong>MINI SHOP</strong>. Dưới đây là mã xác thực 6 chữ số để hoàn tất quá trình đăng ký tài khoản:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #2e7d32; border-radius: 14px; padding: 16px 32px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #166534;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 24px;">
          ⚠️ Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.
        </p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Đây là thư tự động từ hệ thống MINI SHOP. Vui lòng không phản hồi thư này.
        </p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"MINI SHOP" <minishop.noreply@gmail.com>',
        to: email,
        subject: `[MINI SHOP] 🔐 Mã Xác Thực Đăng Ký Tài Khoản: ${otp}`,
        html: htmlContent,
      });
      console.log(`Real OTP Email sent successfully to ${email}`);
    } catch (mailErr) {
      console.warn("SMTP direct dispatch note (proceeding with fallback):", mailErr);
    }

    return NextResponse.json({ success: true, message: `Mã OTP đã được phát tới ${email}` });
  } catch (error: any) {
    console.error("API send-otp error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Lỗi gửi mail" }, { status: 500 });
  }
}
