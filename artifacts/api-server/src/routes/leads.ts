import { Router, type Request, type Response, type NextFunction } from "express";
import { db, leadsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jade2024admin";

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (auth.slice(7) !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  next();
}

router.post("/leads", async (req, res) => {
  try {
    const { phone, source } = req.body as { phone?: string; source?: string };
    const cleaned = (phone ?? "").replace(/\D/g, "");
    if (cleaned.length < 10) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }
    const [lead] = await db
      .insert(leadsTable)
      .values({ phone: `+91${cleaned.slice(-10)}`, source: source ?? "popup" })
      .returning();
    res.status(201).json({ id: lead.id });
  } catch (err) {
    req.log.error({ err }, "Failed to save lead");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads", adminAuth, async (req, res) => {
  try {
    const leads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));
    res.json(leads);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
