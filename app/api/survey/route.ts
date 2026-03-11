import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeEmail, sanitizeText, validateEmail, getClientIp, detectHoneypot } from "@/lib/security";

type SurveyPayload = {
  email: string;
  name: string;
  responses: Record<string, boolean>;
  website?: string;
};

const limiter = rateLimit("survey", 2, 600000);

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const { success } = limiter.check(clientIp);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as SurveyPayload;

  if (detectHoneypot(body)) {
    return NextResponse.json({ ok: true });
  }

  const email = sanitizeEmail(body.email || "");
  const name = sanitizeText(body.name || "", 100);
  const responses = body.responses || {};

  if (!email || !name) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  if (Object.keys(responses).length !== 15) {
    return NextResponse.json(
      { error: "All questions must be answered." },
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

  const { error: surveyError } = await supabase.from("survey_responses").insert([
    {
      email,
      name,
      responses,
    },
  ]);

  if (surveyError) {
    return NextResponse.json(
      { error: "Unable to save survey responses." },
      { status: 500 },
    );
  }

  const { error: leadError } = await supabase
    .from("leads")
    .upsert([{ email, name, source: "survey" }], { onConflict: "email" });

  if (leadError) {
    return NextResponse.json(
      { error: "Unable to save lead.", details: leadError.message },
      { status: 500 },
    );
  }

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("id, question_group, question_order, question_text")
    .order("question_group", { ascending: true })
    .order("question_order", { ascending: true });

  if (questionError) {
    return NextResponse.json(
      { error: "Unable to load questions for email." },
      { status: 500 },
    );
  }

  const responseLines = (questionData || []).map((question) => {
    const answer = responses[question.id] ? "Yes" : "No";
    return `${question.question_group} - ${question.question_order}. ${question.question_text}\nAnswer: ${answer}`;
  });

  const responseBlocks = (questionData || [])
    .map((question) => {
      const answer = responses[question.id] ? "Yes" : "No";
      return `
        <div style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
          <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #9a7b16; margin: 0 0 6px;">${question.question_group}</p>
          <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 8px;">${question.question_order}. ${question.question_text}</p>
          <span style="display: inline-flex; padding: 6px 12px; border-radius: 999px; background: ${answer === "Yes" ? "#1f7a4d" : "#b42318"}; color: #ffffff; font-size: 12px; font-weight: 600;">${answer}</span>
        </div>
      `;
    })
    .join("");

  const { error: resendError } = await resend.emails.send({
    from: `M. Sean Agnew <onboarding@resend.dev>`,
    to: resendEmail,
    subject: `New The Right Fit submission from ${name}`,
    replyTo: email,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      ...responseLines,
    ].join("\n\n"),
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8f6f0; padding: 32px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 32px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);">
          <p style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #9a7b16; margin: 0 0 12px;">The Right Fit Submission</p>
          <h1 style="font-size: 24px; margin: 0 0 12px; color: #111827;">${name} completed the survey</h1>
          <p style="font-size: 15px; color: #475569; margin: 0 0 24px;">Reply directly to follow up.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #111827;">Email</td>
              <td style="padding: 12px 0; color: #475569;">${email}</td>
            </tr>
          </table>
          <div style="border-radius: 14px; background: #fdfaf2; padding: 20px;">
            ${responseBlocks}
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Sent from seanagnew.com</p>
        </div>
      </div>
    `,
  });

  if (resendError) {
    return NextResponse.json(
      { error: resendError.message || "Unable to send survey email." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
