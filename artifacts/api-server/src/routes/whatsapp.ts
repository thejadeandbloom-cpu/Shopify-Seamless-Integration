import { Router } from "express";

const router = Router();

router.get("/whatsapp", (req, res) => {
  const raw = process.env.WHATSAPP_NUMBER;
  if (!raw) {
    res.status(404).send("Not configured");
    return;
  }
  const number = raw.replace(/^\+/, "");
  const text = typeof req.query.text === "string" && req.query.text
    ? req.query.text
    : "Hi! I'd like to know more about Jade and Bloom skincare products.";
  res.redirect(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
});

export default router;
