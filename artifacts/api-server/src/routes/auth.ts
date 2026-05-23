import { Router } from "express";
import { db, otpCodesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";

async function callMakeWebhook(phone: string, code: string): Promise<void> {
  const url = process.env.MAKE_WHATSAPP_WEBHOOK_URL;
  if (!url) throw new Error("MAKE_WHATSAPP_WEBHOOK_URL is not set");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) throw new Error(`Make.com webhook returned ${res.status}`);
}

const router = Router();

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set");
  return new Resend(key);
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(email: string, code: string): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: "Jade and Bloom <sales@thejadeandbloom.com>",
    to: [email],
    subject: `Your login code: ${code}`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#F9F7F5;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C65D3B;font-weight:700;margin-bottom:4px;">Jade and Bloom</div>
        <h1 style="font-size:24px;font-weight:400;color:#0D0D0D;margin:0 0 24px;font-family:Georgia,serif;">Your login code</h1>
        <p style="font-size:14px;color:#484848;line-height:1.6;margin:0 0 24px;">
          Use the code below to log in to your Jade and Bloom account. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#fff;border:1px solid #EBEBEB;border-radius:8px;padding:28px;text-align:center;margin:0 0 24px;">
          <div style="font-size:42px;font-weight:800;letter-spacing:.18em;color:#C65D3B;font-family:monospace;">${code}</div>
        </div>
        <p style="font-size:12px;color:#969696;line-height:1.5;margin:0;">
          If you didn't request this, you can safely ignore this email.<br>
          This code can only be used once.
        </p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

// POST /api/auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }
  const normalised = email.toLowerCase().trim();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await db
      .update(otpCodesTable)
      .set({ used: true })
      .where(and(eq(otpCodesTable.email, normalised), eq(otpCodesTable.used, false)));

    await db.insert(otpCodesTable).values({ email: normalised, code, expiresAt });
    await sendOtpEmail(normalised, code);
    res.json({ success: true });
  } catch (e) {
    req.log.error(e, "Failed to send OTP");
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) { res.status(400).json({ error: "email and code required" }); return; }
  const normalised = email.toLowerCase().trim();

  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, normalised),
          eq(otpCodesTable.code, code.trim()),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, now),
        )
      )
      .limit(1);

    if (!rows.length) {
      res.status(401).json({ error: "Invalid or expired code. Please request a new one." });
      return;
    }

    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, rows[0].id));
    const token = Buffer.from(`${normalised}:${Date.now()}`).toString("base64");
    res.json({ success: true, token, email: normalised });
  } catch (e) {
    req.log.error(e, "Failed to verify OTP");
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/send-otp-whatsapp  — phone-based OTP via Make.com → WhatsApp
router.post("/auth/send-otp-whatsapp", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone || typeof phone !== "string") {
    res.status(400).json({ error: "Valid phone number required" });
    return;
  }
  // Normalise: keep digits only, ensure 10-digit Indian number
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
    return;
  }
  // Use last 10 digits, prefix with country code for storage key
  const normalised = `phone:91${digits.slice(-10)}`;
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await db
      .update(otpCodesTable)
      .set({ used: true })
      .where(and(eq(otpCodesTable.email, normalised), eq(otpCodesTable.used, false)));

    await db.insert(otpCodesTable).values({ email: normalised, code, expiresAt });
    await callMakeWebhook(`91${digits.slice(-10)}`, code);
    res.json({ success: true });
  } catch (e) {
    req.log.error(e, "Failed to send WhatsApp OTP");
    res.status(500).json({ error: "Failed to send WhatsApp message. Please try again." });
  }
});

// POST /api/auth/verify-otp-phone  — verify OTP sent to phone
router.post("/auth/verify-otp-phone", async (req, res) => {
  const { phone, code } = req.body as { phone?: string; code?: string };
  if (!phone || !code) { res.status(400).json({ error: "phone and code required" }); return; }
  const digits = phone.replace(/\D/g, "");
  const normalised = `phone:91${digits.slice(-10)}`;

  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, normalised),
          eq(otpCodesTable.code, code.trim()),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, now),
        )
      )
      .limit(1);

    if (!rows.length) {
      res.status(401).json({ error: "Invalid or expired code. Please request a new one." });
      return;
    }

    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, rows[0].id));
    const token = Buffer.from(`${normalised}:${Date.now()}`).toString("base64");
    res.json({ success: true, token, email: normalised });
  } catch (e) {
    req.log.error(e, "Failed to verify phone OTP");
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

export default router;
