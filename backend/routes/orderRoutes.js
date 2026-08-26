const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// create new order
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      city,
      pincode,
      instructions,
      items,
      totalAmount,
      paymentMethod,
      cardHolderName,
      cardLast4,
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, delivery address, items, and total amount are required.",
      });
    }

    // format unique order id
    const orderCount = await Order.countDocuments();
    const orderId = `#FF-${Math.floor(10000 + Math.random() * 90000)}-${orderCount + 1}`;

    const newOrder = await Order.create({
      orderId,
      user: userId || null,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone,
      deliveryAddress,
      city: city || "Mumbai",
      pincode: pincode || "400001",
      instructions: instructions || "",
      items,
      totalAmount,
      paymentMethod: paymentMethod || "card",
      cardHolderName: cardHolderName || "Valued Customer",
      cardLast4: cardLast4 || "4242",
      status: "Preparing",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
});

// get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
});

// update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["Preparing", "Out for Delivery", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderId: id };
    const order = await Order.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
});

// delete order by id or orderId
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderId: id };
    const order = await Order.findOneAndDelete(filter);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
    });
  }
});

module.exports = router;
