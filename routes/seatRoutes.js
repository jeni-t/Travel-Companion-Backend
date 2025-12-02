const express = require("express");
const router = express.Router();

// Example: Mock seat map for demonstration
router.post("/", async (req, res) => {
  const { flightNumber, departureDate, cabinClass } = req.body;

  if (!flightNumber || !departureDate || !cabinClass) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Mock seat map
  const seatMap = {
    flightNumber,
    departureDate,
    cabinClass,
    seats: [
      { seatNumber: "1A", available: true },
      { seatNumber: "1B", available: true },
      { seatNumber: "1C", available: true },
      { seatNumber: "2A", available: true },
      { seatNumber: "2B", available: true },
      { seatNumber: "2C", available: true },
    ],
  };

  res.json(seatMap);
});

module.exports = router;

