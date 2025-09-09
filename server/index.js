const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const connectToDatabase = require("./database/config");
const authRoutes = require("./routes/authRoutes");
const tagRoutes = require("./routes/tagRoutes");
const technologyRoutes = require("./routes/technologyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

<<<<<<< Updated upstream
// Ensure DB is connected on boot
connectToDatabase().catch(() => {
	// Database connection error handled silently
=======
connectToDatabase().catch((err) => {
  console.error("Failed to connect to database on startup:", err.message);
>>>>>>> Stashed changes
});

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/technologies", technologyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
<<<<<<< Updated upstream
	console.log(`Server listening on port ${PORT}`);
});
=======
  console.log(`Server listening on port ${PORT}`);
});
>>>>>>> Stashed changes
