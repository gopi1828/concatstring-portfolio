const express = require("express");
const {
  register,
  login,
  logout,
  getUserById,
  updateUserById,
  getUser,
  deleteUserById,
} = require("../controller/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/users", authenticateToken, getUser)
router.get("/users/:id", authenticateToken, getUserById);
router.put("/users/:id", authenticateToken, updateUserById);
router.delete("/users/:id", authenticateToken, deleteUserById);

module.exports = router;
