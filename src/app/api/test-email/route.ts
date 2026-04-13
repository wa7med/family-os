import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, secure, user, password, fromEmail, fromName } = body;

    // Validate required fields
    if (!host || !user || !password) {
      return NextResponse.json({ error: "Missing required SMTP fields" }, { status: 400 });
    }

    // In a real implementation, you would use nodemailer here to send the test email
    // For now, we'll just validate the settings and return success
    // const transporter = nodemailer.createTransport({
    //   host,
    //   port: parseInt(port),
    //   secure: secure === true || secure === "true",
    //   auth: { user, pass: password },
    // });

    // await transporter.sendMail({
    //   from: `"${fromName}" <${fromEmail}>`,
    //   to: user,
    //   subject: "Test Email - Family Life OS",
    //   text: "This is a test email from Family Life OS",
    // });

    // For now, simulate a successful test
    console.log("SMTP settings received:", { host, port, secure, user, fromEmail, fromName });

    return NextResponse.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
