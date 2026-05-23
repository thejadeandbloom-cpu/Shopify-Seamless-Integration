import { Router } from "express";

const router = Router();

router.get("/whatsapp", (req, res) => {
  const number = process.env.WHATSAPP_NUMBER;
  if (!number) {
    res.status(404).send("Not configured");
    return;
  }
  const message = encodeURIComponent(
    "Hi! I'd like to know more about Jade and Bloom skincare products."
  );
  res.redirect(`https://wa.me/${number}?text=${message}`);
});

export default router;
