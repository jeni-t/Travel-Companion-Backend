const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("🔥 Stripe Payment Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
