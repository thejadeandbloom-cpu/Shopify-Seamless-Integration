import { Router, type Request, type Response, type NextFunction } from "express";
import { db, refundClaimsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jade2024admin";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  next();
}

router.post("/refund-claims", async (req, res) => {
  try {
    const { name, email, phone, orderId, product, purchaseDate, usageLog, reason, bankDetails } = req.body as Record<string, string>;

    if (!name || !email || !phone || !orderId || !product || !purchaseDate || !usageLog || !reason || !bankDetails) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Validate claim is within 30 days of purchase date
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const daysSincePurchase = Math.floor((today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePurchase > 30) {
      res.status(400).json({ error: `Your purchase date was ${daysSincePurchase} days ago. Claims must be submitted within 30 days of purchase.` });
      return;
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const existingClaims = await db
      .select()
      .from(refundClaimsTable)
      .where(eq(refundClaimsTable.email, email.toLowerCase().trim()));

    let abuseFlag = "";

    const claimsInLastYear = existingClaims.filter(
      (c) => new Date(c.createdAt) > oneYearAgo
    );

    if (claimsInLastYear.length > 0) {
      abuseFlag = `Prior claim on ${new Date(claimsInLastYear[0].createdAt).toLocaleDateString("en-IN")} (${claimsInLastYear[0].product})`;
    }

    const [claim] = await db.insert(refundClaimsTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      orderId: orderId.trim(),
      product,
      purchaseDate,
      reason: reason.trim(),
      bankDetails: bankDetails.trim(),
      usageLog: usageLog.trim(),
      abuseFlag,
    }).returning();

    res.status(201).json({ id: claim.id, abuseFlag });
  } catch (err) {
    req.log.error({ err }, "Failed to create refund claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/refund-claims", adminAuth, async (req, res) => {
  try {
    const claims = await db
      .select()
      .from(refundClaimsTable)
      .orderBy(desc(refundClaimsTable.createdAt));
    res.json(claims);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch refund claims");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/refund-claims/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { status, refunded, notes } = req.body as { status?: string; refunded?: boolean; notes?: string };
    const update: Partial<{ status: string; refunded: boolean; notes: string }> = {};
    if (status !== undefined) update.status = status;
    if (refunded !== undefined) update.refunded = refunded;
    if (notes !== undefined) update.notes = notes;

    const [updated] = await db
      .update(refundClaimsTable)
      .set(update)
      .where(eq(refundClaimsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update refund claim");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
