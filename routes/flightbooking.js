// routes/flightbooking.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();

const nodemailer = require("nodemailer");
const twilio = require("twilio");
const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// --- Schema ---
const FlightBookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,

  from: String,
  to: String,
  date: String,
  time: String,
  seat: String,
  adults: Number,
  amount: Number,

  paymentMethod: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  zip: String,

  createdAt: { type: Date, default: Date.now },
});

const Booking =
  mongoose.models.FlightBooking ||
  mongoose.model("FlightBooking", FlightBookingSchema);

// --- Email transporter (Brevo SMTP) ---
const emailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Sanitize phone numbers
function formatPhone(raw) {
  if (!raw) return raw;
  let s = raw.toString().trim();
  s = s.replace(/\s+/g, "");
  s = s.replace(/^0+/, "");
  if (s.startsWith("+")) return s;
  if (s.length === 10) return `+91${s}`;
  return s;
}

// ---------------------------------------------------
// POST /api/flightbooking/book
// ---------------------------------------------------
router.post("/book", async (req, res) => {
  try {
    const payload = req.body;
    const newBooking = new Booking(payload);
    const saved = await newBooking.save();

    // EMAIL
    try {
      const html = `
        <h2>Your Flight Booking is Confirmed</h2>
        <p><strong>Name:</strong> ${saved.name}</p>
        <p><strong>From:</strong> ${saved.from}</p>
        <p><strong>To:</strong> ${saved.to}</p>
        <p><strong>Date:</strong> ${saved.date}</p>
        <p><strong>Time:</strong> ${saved.time}</p>
        <p><strong>Seat:</strong> ${saved.seat}</p>
        <p><strong>Adults:</strong> ${saved.adults}</p>
        <p><strong>Amount:</strong> ₹${saved.amount}</p>
        <p><strong>Payment Method:</strong> ${saved.paymentMethod}</p>
      `;

      await emailTransporter.sendMail({
        from: process.env.BREVO_FROM,
        to: saved.email,
        subject: "Flight Booking Confirmation",
        html,
      });
    } catch (err) {
      console.error("EMAIL ERROR:", err);
    }

    // SMS
    try {
      const toPhone = formatPhone(saved.phone);

      if (process.env.TWILIO_PHONE && toPhone) {
        await smsClient.messages.create({
          body: `✈️ Booking Confirmed: ${saved.from} → ${saved.to} on ${saved.date}. Amount: ₹${saved.amount}`,
          from: process.env.TWILIO_PHONE,
          to: toPhone,
        });
      }
    } catch (err) {
      console.error("SMS ERROR:", err);
    }

    return res.status(201).json({ message: "Booking success", booking: saved });
  } catch (err) {
    console.error("SERVER ERROR /book:", err);
    return res
      .status(500)
      .json({ error: "Server error while booking", details: err.message });
  }
});

// ---------------------------------------------------
// GET /api/flightbooking/flighthistory
// ---------------------------------------------------
router.get("/flighthistory", async (req, res) => {
  try {
    const history = await Booking.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch history" });
  }
});

// ---------------------------------------------------
// DELETE /api/flightbooking/delete/:id
// ---------------------------------------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Booking not found" });

    return res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------
// PUT /api/flightbooking/update/:id
// ---------------------------------------------------
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Booking not found" });

    return res.json({ success: true, booking: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
