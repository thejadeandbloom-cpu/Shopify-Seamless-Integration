import { Router, type IRouter } from "express";

const router: IRouter = Router();

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getShiprocketToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return null;

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { token?: string };
    if (data.token) {
      cachedToken = data.token;
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch {
  }
  return null;
}

router.get("/api/pincode/check", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode || typeof pincode !== "string" || !/^\d{6}$/.test(pincode)) {
    res.status(400).json({ error: "Enter a valid 6-digit pincode" });
    return;
  }

  const token = await getShiprocketToken();
  if (!token) {
    res.json({ available: true, message: "Delivery available across India", note: "credentials_pending" });
    return;
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE ?? "110001";

  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${pincode}&cod=1&weight=0.5`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await resp.json()) as {
      data?: { available_courier_companies?: unknown[] };
    };
    const available =
      Array.isArray(data?.data?.available_courier_companies) &&
      data.data!.available_courier_companies.length > 0;
    res.json({
      available,
      message: available
        ? "Delivery available to your pincode ✓"
        : "This pincode is not serviceable yet — reach out to us on WhatsApp.",
    });
  } catch {
    res.status(500).json({ error: "Could not check availability. Please try again." });
  }
});

export default router;
