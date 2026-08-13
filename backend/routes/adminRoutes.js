const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// admin dashboard data (users + orders)
router.get("/dashboard", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const orders = await Order.find().sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        activeOrders,
      },
      users,
      orders,
    });
  } catch (error) {
    console.error("Admin dashboard fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin database portal data",
    });
  }
});

// verify admin passcode
router.post("/verify-passcode", (req, res) => {
  const { passcode } = req.body;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "REMOVED_SECRET";

  if (passcode === ADMIN_PASSCODE) {
    return res.status(200).json({
      success: true,
      message: "Admin passcode verified successfully!",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid admin passcode! Access denied.",
  });
});

// delete user record from database
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted from database successfully",
      id,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user record",
    });
  }
});

// delete order record from database
router.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found in database",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order deleted from database successfully",
      id,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order record",
    });
  }
});

module.exports = router;
