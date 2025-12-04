
const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
//const flightRoutes = require('./routes/flightSearch');
const { ensureAccessToken } = require("./amadeus"); // ✅ Fix here
const seatRoutes = require("./routes/seatRoutes");
const flightbookingRoutes = require("./routes/flightbooking");
const contactRoute = require("./routes/contact");
const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes);
//app.use('/api/flights', flightRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/flightbooking", flightbookingRoutes);
app.use("/api", contactRoute);

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

app.get("/api/iata", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "City required" });

  try {
    const token = await ensureAccessToken();

    const response = await axios.get("https://test.api.amadeus.com/v1/reference-data/locations", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        keyword: city,
        subType: "CITY",
      },
    });

    const iataCode = response.data?.data?.[0]?.iataCode;

    if (!iataCode) {
      console.log("⚠️ No IATA code found for", city);
      return res.status(404).json({ error: "IATA code not found" });
    }

    res.json({ iataCode });
  } catch (err) {
    console.error("❌ IATA fetch error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to get IATA code" });
  }
});


// Get flights between two IATA codes
app.get("/api/flights", async (req, res) => {
  const { origin, destination, date, adults, travelClass } = req.query;

  if (!origin || !destination || !date || !adults)
    return res.status(400).json({ error: "Missing required parameters" });

  try {
    const token = await ensureAccessToken();

    const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults,
        travelClass,
        currencyCode: "INR",
        max: 10,
      },
    });

    res.json(response.data.data);
  } catch (err) {
    console.error("❌ Flight fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port 5000"));

//module.exports = router;