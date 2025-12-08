import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy initialization - only create Resend instance when API key exists
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Trim and validate required fields
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        { error: "Alla fält är obligatoriska" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Ogiltig e-postadress" },
        { status: 400 }
      );
    }

    // Send email using Resend
    const resend = getResend();
    if (!resend) {
      // In development/build, log and return success if API key is missing
      if (process.env.NODE_ENV !== "production") {
        console.log("Contact form submission (no API key):", {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        });
        return NextResponse.json(
          { success: true, message: "Meddelandet har skickats!" },
          { status: 200 }
        );
      }
      throw new Error("RESEND_API_KEY is not configured");
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "Sajtstudio Kontaktformulär <onboarding@resend.dev>", // You'll need to verify your domain with Resend
        to: ["hello@sajtstudio.se"],
        subject: `Nytt meddelande från ${trimmedName} - Sajtstudio`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000; border-bottom: 2px solid #0066FF; padding-bottom: 10px;">
              Nytt meddelande från kontaktformuläret
            </h2>
            <div style="margin-top: 20px;">
              <p><strong>Från:</strong> ${trimmedName}</p>
              <p><strong>E-post:</strong> <a href="mailto:${trimmedEmail}">${trimmedEmail}</a></p>
            </div>
            <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #0066FF;">
              <h3 style="color: #000; margin-top: 0;">Meddelande:</h3>
              <p style="color: #333; white-space: pre-wrap;">${trimmedMessage.replace(
                /\n/g,
                "<br>"
              )}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>Detta meddelande skickades från kontaktformuläret på sajtstudio.se</p>
            </div>
          </div>
        `,
        replyTo: trimmedEmail, // So you can reply directly to the sender
      });

      if (error) {
        console.error("Resend error:", error);
        // In development, still log and return success
        if (process.env.NODE_ENV === "development") {
          console.log("Contact form submission (email failed):", {
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage,
          });
          return NextResponse.json(
            { success: true, message: "Meddelandet har skickats!" },
            { status: 200 }
          );
        }
        throw error;
      }

      // Log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Email sent successfully:", data);
        console.log("Contact form submission:", {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        });
      }

      return NextResponse.json(
        { success: true, message: "Meddelandet har skickats!" },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // In development, still return success even if email fails
      if (process.env.NODE_ENV === "development") {
        console.log("Contact form submission (email failed, dev mode):", {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        });
        return NextResponse.json(
          { success: true, message: "Meddelandet har skickats!" },
          { status: 200 }
        );
      }

      // In production, return error
      throw emailError;
    }
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Något gick fel. Försök igen senare." },
      { status: 500 }
    );
  }
}
