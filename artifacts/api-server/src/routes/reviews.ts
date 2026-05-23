import { Router, type Request, type Response, type NextFunction } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, and, lte, desc } from "drizzle-orm";

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jade2024admin";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (auth.slice(7) !== ADMIN_PASSWORD) { res.status(401).json({ error: "Invalid credentials" }); return; }
  next();
}

router.post("/reviews", async (req, res) => {
  const { productHandle, productLabel, customerName, customerEmail, city, orderId, rating, title, body } = req.body as Record<string, string>;
  if (!productHandle || !customerName || !customerEmail || !orderId || !rating || !body) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const r = parseInt(String(rating));
  if (r < 1 || r > 5) { res.status(400).json({ error: "Rating must be 1–5" }); return; }
  const visibleAfter = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    const [review] = await db.insert(reviewsTable).values({
      productHandle,
      productLabel: productLabel || productHandle,
      customerName,
      customerEmail,
      city: city || "",
      orderId,
      rating: r,
      title: title || "",
      body,
      visibleAfter,
    }).returning();
    res.json({ success: true, id: review.id });
  } catch (e) {
    req.log.error(e, "Failed to save review");
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.get("/reviews", async (req, res) => {
  const { product } = req.query;
  try {
    const now = new Date();
    const rows = await db.select().from(reviewsTable)
      .where(and(eq(reviewsTable.isApproved, true), lte(reviewsTable.visibleAfter, now)))
      .orderBy(desc(reviewsTable.createdAt));
    const filtered = product && typeof product === "string"
      ? rows.filter((r) => r.productLabel === product)
      : rows;
    res.json(filtered);
  } catch (e) {
    req.log.error(e, "Failed to fetch reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/my-reviews", async (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") { res.status(400).json({ error: "email required" }); return; }
  try {
    const rows = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.customerEmail, email.toLowerCase().trim()))
      .orderBy(desc(reviewsTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e, "Failed to fetch my-reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/admin/reviews", adminAuth, async (req, res) => {
  try {
    const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e, "Failed to fetch admin reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.patch("/admin/reviews/:id", adminAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { isApproved } = req.body as { isApproved: boolean };
  try {
    const [updated] = await db.update(reviewsTable)
      .set({ isApproved })
      .where(eq(reviewsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Review not found" }); return; }
    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

export default router;
