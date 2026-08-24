import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Thiếu email hoặc mã OTP" }, { status: 400 });
    }

    const targetEmail = String(email).trim().toLowerCase();
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

    const subject = `Mã xác thực OTP đăng ký tài khoản Mini Shop: ${otp}`;

    const plainTextContent = `
MINI SHOP - Xác Thực Đăng Ký Tài Khoản

Xin chào ${name || targetEmail},
Cảm ơn bạn đã lựa chọn mua sắm tại MINI SHOP.

Mã xác thực OTP của bạn là: ${otp}

Lưu ý: Mã xác thực có hiệu lực trong vòng 5 phút. Vui lòng không cung cấp mã OTP này cho bất kỳ ai để đảm bảo an toàn tài khoản.

---
Cửa Hàng Nội Thất MINI SHOP Việt Nam
Địa chỉ: 237 Nguyễn Văn Cừ, Phường Bến Thành, Quận 5, TP. Hồ Chí Minh
Hotline: 1900 6868 • Email hỗ trợ: cskh@minishop.vn
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader preview text for Gmail Inbox -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Mã xác thực OTP của bạn là: ${otp}. Hoàn tất đăng ký tài khoản Mini Shop ngay.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
              <span style="display: inline-block; background-color: #2e7d32; color: #ffffff; font-weight: 900; font-size: 20px; letter-spacing: 1px; padding: 8px 20px; border-radius: 10px;">
                MINI SHOP
              </span>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">
                Xác Thực Đăng Ký Tài Khoản
              </h2>

              <p style="color: #475569; font-size: 14.5px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong>${name || targetEmail}</strong>,<br>
                Cảm ơn bạn đã lựa chọn mua sắm tại <strong>MINI SHOP</strong>. Dưới đây là mã xác thực 6 chữ số để hoàn tất quá trình tạo tài khoản của bạn:
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #2e7d32; border-radius: 14px; padding: 16px 36px; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #15803d;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
                ⏱ Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>.<br>
                Vì lý do an toàn, vui lòng <strong>không chia sẻ mã này</strong> cho bất kỳ ai khác.
              </p>
            </td>
          </tr>

          <!-- Footer & CAN-SPAM Compliance Info -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 6px 0;">
                <strong>Hệ Thống Nội Thất MINI SHOP Việt Nam</strong><br>
                Địa chỉ: 237 Nguyễn Văn Cừ, Phường Bến Thành, Quận 5, TP. Hồ Chí Minh<br>
                Hotline hỗ trợ: 1900 6868 • Email: cskh@minishop.vn
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0 0;">
                Bạn nhận được email này vì địa chỉ của bạn vừa được sử dụng để đăng ký tại Mini Shop.<br>
                Đây là thư gửi tự động, vui lòng không phản hồi thư này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Dispatch real email via Gmail SMTP with complete RFC anti-spam headers
    const info = await transporter.sendMail({
      from: `"Mini Shop Việt Nam" <${smtpUser}>`,
      replyTo: smtpUser,
      to: targetEmail,
      subject: subject,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        "X-Mailer": "MINI-SHOP Identity Service v2.0",
        "X-Priority": "1",
        "Importance": "high",
        "X-Auto-Response-Suppress": "All",
      },
    });

    console.log(`[MINI SHOP OTP] Email dispatched successfully to ${targetEmail} (MessageId: ${info.messageId})`);

    return NextResponse.json({ success: true, message: `Mã OTP đã được gửi thành công tới ${targetEmail}` });
  } catch (error: any) {
    console.error("API send-otp error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Lỗi gửi mail" }, { status: 500 });
  }
}
