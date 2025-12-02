const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: String,
  phone: String,
  message: String,
});

const ContactPage = mongoose.model("ContactPage", contactSchema);

router.post("/contactpage", async (req, res) => {
  try {
    const newContact = new ContactPage(req.body);
    const saved = await newContact.save();

    res.status(201).json({
      message: "Message submitted successfully!",
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;   // <-- THIS MUST BE ADDED
