import { NextResponse } from "next/server";

const RESEND_URL = "https://api.resend.com/emails";
// ponytail: onboarding@resend.dev works without a verified domain but can only
// deliver to the Resend account owner's inbox; set RESEND_FROM after verifying
// a domain so subscriber confirmations actually deliver
// || not ??: an empty string in .env must fall back too
const FROM = process.env.RESEND_FROM || "Bluefin <onboarding@resend.dev>";
const NOTIFY_TO = process.env.CONTACT_EMAIL || "anshul.ab17x@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://blue-fin.vercel.app";

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
      subject: "You're in the ocean",
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:48px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0d1520;border:1px solid #1a2840;border-radius:16px;overflow:hidden;max-width:520px;width:100%">
        <tr><td style="padding:40px 40px 32px;text-align:center">
          <img src="${SITE_URL}/assets/logos/bluefin_light.png" alt="Bluefin" width="140" style="display:block;margin:0 auto 32px;max-width:140px">
          <h1 style="margin:0 0 12px;color:#e8f0fe;font-size:22px;font-weight:700;letter-spacing:-0.3px">You're in the ocean.</h1>
          <p style="margin:0 0 28px;color:#8096b4;font-size:15px;line-height:1.7">
            Thanks for subscribing to Bluefin. You'll get market updates<br>and protocol news as they happen.
          </p>
          <a href="${SITE_URL}/markets" style="display:inline-block;background:#2f6fed;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:999px">
            Explore Markets
          </a>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #1a2840">
          <p style="margin:0;color:#4a6080;font-size:12px">Decentralized prediction markets · Settled on Solana</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (e) {
    console.error("subscribe confirmation failed:", e);
  }

  return NextResponse.json({ ok: true });
}
