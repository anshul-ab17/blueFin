import { NextResponse } from "next/server";

const RESEND_URL = "https://api.resend.com/emails";
// ponytail: onboarding@resend.dev works without a verified domain but can only
// deliver to the Resend account owner's inbox; set RESEND_FROM after verifying
// a domain so subscriber confirmations actually deliver
// || not ??: an empty string in .env must fall back too
const FROM = process.env.RESEND_FROM || "Bluefin <onboarding@resend.dev>";
const NOTIFY_TO = process.env.CONTACT_EMAIL || "anshul.ab17x@gmail.com";

async function sendEmail(apiKey: string, payload: object) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email not configured" }, { status: 503 });

  let email: unknown;
  let message: unknown;
  try {
    ({ email, message } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const note = typeof message === "string" ? message.slice(0, 1000).trim() : "";

  try {
    await sendEmail(apiKey, {
      from: FROM,
      to: [NOTIFY_TO],
      subject: "New Bluefin subscriber",
      text: `New newsletter signup:\n\nEmail: ${email}${note ? `\n\nMessage:\n${note}` : ""}`,
    });
  } catch (e) {
    console.error("subscribe notify failed:", e);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 502 });
  }

  // confirmation is best-effort; without a verified domain Resend rejects
  // sends to arbitrary addresses, and that shouldn't fail the signup
  try {
    await sendEmail(apiKey, {
      from: FROM,
      to: [email],
      subject: "You're in the ocean 🐋",
      text: "Thanks for subscribing to Bluefin! You'll get market updates and protocol news soon.",
    });
  } catch (e) {
    console.error("subscribe confirmation failed:", e);
  }

  return NextResponse.json({ ok: true });
}
