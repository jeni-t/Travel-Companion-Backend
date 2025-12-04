const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* ----------------------- REGISTER ----------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, lastname, email, password, phone } = req.body;

    // Already user exists?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      lastname,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    return res.status(201).json({ msg: "Registered successfully" });
  } catch (err) {
    console.error("REG ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ------------------------- LOGIN ------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    return res.status(200).json({ msg: "Login successful", user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
