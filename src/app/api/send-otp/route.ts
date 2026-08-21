import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Thiếu email hoặc mã OTP" }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER || "binhpham.1512202@gmail.com";
    const smtpPass = process.env.SMTP_PASS || "xdpjjxuaajocvplc";

    // Configure authentic Gmail SMTP transport with App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #2e7d32; color: #ffffff; padding: 10px 24px; border-radius: 12px; font-weight: 800; font-size: 22px; letter-spacing: 0.5px;">
            🛍️ MINI SHOP
          </div>
        </div>
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 14px; text-align: center;">
          Xác Thực Đăng Ký Tài Khoản
        </h2>
        
        <p style="color: #475569; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
          Xin chào <strong>${name || email}</strong>,<br>
          Cảm ơn bạn đã lựa chọn mua sắm tại <strong>MINI SHOP</strong>. Dưới đây là mã xác thực 6 chữ số để hoàn tất quá trình đăng ký tài khoản của bạn:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #2e7d32; border-radius: 14px; padding: 18px 36px; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #15803d;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
          ⚠️ Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.
        </p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Đây là thư tự động từ hệ thống MINI SHOP. Vui lòng không phản hồi thư này.
        </p>
      </div>
    `;

    // Dispatch real email via Gmail SMTP
    const info = await transporter.sendMail({
      from: `"MINI SHOP" <${smtpUser}>`,
      to: email,
      subject: `[MINI SHOP] 🔐 Mã Xác Thực Đăng Ký Tài Khoản: ${otp}`,
      html: htmlContent,
    });

    console.log(`[MINI SHOP OTP] Email dispatched successfully to ${email} (MessageId: ${info.messageId})`);

    return NextResponse.json({ success: true, message: `Mã OTP đã được gửi thành công tới ${email}` });
  } catch (error: any) {
    console.error("API send-otp error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Lỗi gửi mail" }, { status: 500 });
  }
}
