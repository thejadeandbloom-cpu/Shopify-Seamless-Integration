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

// POST /api/reviews
router.post("/reviews", async (req, res) => {
  const { productHandle, productLabel, customerName, customerEmail, city, orderId, rating, title, body, imageUrl } =
    req.body as Record<string, string>;
  if (!productHandle || !customerName || !customerEmail || !orderId || !rating || !body) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const r = parseInt(String(rating));
  if (r < 1 || r > 5) { res.status(400).json({ error: "Rating must be 1–5" }); return; }

  const normEmail = customerEmail.toLowerCase().trim();

  try {
    // Enforce one review per product per customer
    const existing = await db.select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.customerEmail, normEmail), eq(reviewsTable.productHandle, productHandle)))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "You have already reviewed this product. You can edit your existing review." });
      return;
    }

    const visibleAfter = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [review] = await db.insert(reviewsTable).values({
      productHandle,
      productLabel: productLabel || productHandle,
      customerName,
      customerEmail: normEmail,
      city: city || "",
      orderId,
      rating: r,
      title: title || "",
      body,
      imageUrl: imageUrl || "",
      visibleAfter,
    }).returning();
    res.json({ success: true, id: review.id });
  } catch (e) {
    req.log.error(e, "Failed to save review");
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// PUT /api/reviews/:id  — customer edits their own review
router.put("/reviews/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { email, rating, title, body, imageUrl, city, customerName } =
    req.body as Record<string, string>;

  if (!email || !rating || !body) {
    res.status(400).json({ error: "email, rating and body are required" }); return;
  }
  const r = parseInt(String(rating));
  if (r < 1 || r > 5) { res.status(400).json({ error: "Rating must be 1–5" }); return; }

  try {
    const rows = await db.select().from(reviewsTable)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.customerEmail, email.toLowerCase().trim())))
      .limit(1);
    if (!rows.length) {
      res.status(404).json({ error: "Review not found or email does not match" }); return;
    }
    const [updated] = await db.update(reviewsTable)
      .set({
        rating: r,
        title: title || "",
        body,
        imageUrl: imageUrl !== undefined ? imageUrl : rows[0].imageUrl,
        city: city !== undefined ? city : rows[0].city,
        customerName: customerName || rows[0].customerName,
        isApproved: false,
        updatedAt: new Date(),
      })
      .where(eq(reviewsTable.id, id))
      .returning();
    res.json({ success: true, review: updated });
  } catch (e) {
    req.log.error(e, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

// GET /api/reviews/:id — fetch a single review (public, used for edit pre-fill)
router.get("/reviews/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { email } = req.query;
  try {
    const rows = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.id, id))
      .limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    // Only return full data if email matches
    if (email && typeof email === "string" && rows[0].customerEmail !== email.toLowerCase().trim()) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    res.json(rows[0]);
  } catch (e) {
    req.log.error(e, "Failed to fetch review");
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

// GET /api/reviews — public approved reviews
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

// GET /api/my-reviews — all reviews for an email (any status)
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

// GET /api/admin/reviews
router.get("/admin/reviews", adminAuth, async (req, res) => {
  try {
    const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(rows);
  } catch (e) {
    req.log.error(e, "Failed to fetch admin reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// PATCH /api/admin/reviews/:id — approve/revoke
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
