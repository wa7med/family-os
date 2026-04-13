import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, secure, user, password, fromEmail, fromName, recipientEmail } = body;

    // Validate required fields
    if (!host) {
      return NextResponse.json({ success: false, message: "SMTP host is required" }, { status: 400 });
    }
    if (!user) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 });
    }
    if (!recipientEmail) {
      return NextResponse.json({ success: false, message: "Recipient email is required" }, { status: 400 });
    }

    console.log("Sending test email via SMTP:", { host, port, user, recipientEmail });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure: secure === true || secure === "tls",
      auth: {
        user,
        pass: password,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"${fromName || "Family Life OS"}" <${fromEmail || user}>`,
      to: recipientEmail,
      subject: "Test Email - Family Life OS",
      text: `This is a test email from Family Life OS.

Your SMTP settings are working correctly!

SMTP Server: ${host}
Port: ${port}

---
Family Life OS`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #5B8A72;">Family Life OS</h2>
          <p>This is a test email from Family Life OS.</p>
          <p>Your SMTP settings are working correctly!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p><strong>SMTP Server:</strong> ${host}</p>
            <p><strong>Port:</strong> ${port}</p>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">Family Life OS - Your family's life management app</p>
        </div>
      `,
    });

    console.log("Test email sent:", info.messageId);

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}!`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("Email send error:", error);

    // Provide helpful error messages
    if (error.code === "EAUTH") {
      return NextResponse.json({
        success: false,
        message: "Authentication failed. Check your username and password.",
      }, { status: 400 });
    }
    if (error.code === "ECONNREFUSED") {
      return NextResponse.json({
        success: false,
        message: `Connection refused. Check that ${host} is correct and accessible.`,
      }, { status: 400 });
    }
    if (error.code === "ETIMEDOUT") {
      return NextResponse.json({
        success: false,
        message: "Connection timed out. Check the host and port.",
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: `Failed to send email: ${error.message}`,
    }, { status: 500 });
  }
}
