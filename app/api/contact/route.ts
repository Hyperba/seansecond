import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeEmail, sanitizeText, validateEmail, getClientIp, detectHoneypot } from "@/lib/security";

type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string;
};

const limiter = rateLimit("contact", 3, 300000);

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const { success } = limiter.check(clientIp);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as ContactPayload;

  if (detectHoneypot(body)) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitizeText(body.name || "", 100);
  const email = sanitizeEmail(body.email || "");
  const company = body.company ? sanitizeText(body.company, 100) : undefined;
  const message = sanitizeText(body.message || "", 5000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendEmail = process.env.RESEND_EMAIL;

  if (!supabaseUrl || !supabaseAnonKey || !resendApiKey || !resendEmail) {
    return NextResponse.json(
      { error: "Missing required environment configuration." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const resend = new Resend(resendApiKey);

  const { error: insertError } = await supabase.from("contact-form").insert([
    {
      name,
      email,
      company: company || null,
      message,
    },
  ]);

  if (insertError) {
    return NextResponse.json(
      { error: "Unable to save submission." },
      { status: 500 },
    );
  }

  const { error: leadError } = await supabase
    .from("leads")
    .upsert([{ email, name, source: "contact-form" }], { onConflict: "email" });

  if (leadError) {
    return NextResponse.json(
      { error: "Unable to save lead.", details: leadError.message },
      { status: 500 },
    );
  }

  const { error: resendError } = await resend.emails.send({
    from: `M. Sean Agnew <onboarding@resend.dev>`,
    to: resendEmail,
    subject: `New contact request from ${name}`,
    replyTo: email,
    text: [
      `New contact request`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "N/A"}`,
      "",
      message,
    ].join("\n"),
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8f6f0; padding: 32px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);">
          <p style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #9a7b16; margin: 0 0 12px;">New Contact Request</p>
          <h1 style="font-size: 24px; margin: 0 0 12px; color: #111827;">${name} sent a message</h1>
          <p style="font-size: 15px; color: #475569; margin: 0 0 24px;">Reply directly to this email to respond.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #111827;">Email</td>
              <td style="padding: 12px 0; color: #475569;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #111827;">Company</td>
              <td style="padding: 12px 0; color: #475569;">${company || "N/A"}</td>
            </tr>
          </table>
          <div style="background: #fdfaf2; border-radius: 12px; padding: 20px; color: #1f2937; line-height: 1.6;">${message.replace(/\n/g, "<br />")}</div>
          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Sent from seanagnew.com</p>
        </div>
      </div>
    `,
  });

  if (resendError) {
    return NextResponse.json(
      { error: resendError.message || "Unable to send confirmation email." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
