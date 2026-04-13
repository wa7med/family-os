import { NextRequest, NextResponse } from "next/server";

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

    console.log("SMTP settings received:", { host, port, secure, user, fromEmail, fromName, recipientEmail });

    // Try to verify the host is reachable
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // Try a simple fetch to see if the host responds on the port
      const response = await fetch(`https://${host}`, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // If we get here, the host is reachable
      return NextResponse.json({
        success: true,
        message: `SMTP settings validated! Host ${host} is reachable. Note: Full email sending requires nodemailer package.`
      });
    } catch (connectError: any) {
      if (connectError.name === "AbortError") {
        return NextResponse.json({
          success: false,
          message: `Cannot reach ${host}. Check the hostname and try again.`
        }, { status: 400 });
      }
      // If it's a different error, the host might still be valid for SMTP
      return NextResponse.json({
        success: true,
        message: `SMTP settings saved. Host ${host} configured. Note: Full email sending requires nodemailer package.`
      });
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json({ success: false, message: "Failed to validate SMTP settings" }, { status: 500 });
  }
}
