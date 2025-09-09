const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const secret =
    process.env.JWT_SECRETKEY ||
    process.env.JWT_SECRET ||
    "dev_secret_key_change_me";

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log("JWT verification failed:", err.message);

      // Provide specific error message based on error type
      let errorMessage = "Invalid token";
      if (err.name === "TokenExpiredError") {
        errorMessage = "Token has expired. Please login again.";
      } else if (err.name === "JsonWebTokenError") {
        errorMessage = "Invalid token format. Please login again.";
      } else if (err.name === "NotBeforeError") {
        errorMessage = "Token not active yet. Please try again later.";
      }

      return res.status(401).json({ message: errorMessage });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
