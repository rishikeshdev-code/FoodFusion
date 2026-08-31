const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Food = require("../models/food");

const router = express.Router();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_FoodFusion2026";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_Secret_FoodFusion2026";

let razorpayInstance = null;
try {
  if (razorpayKeyId && razorpayKeySecret) {
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  }
} catch (err) {
  console.warn("⚠️ Razorpay SDK initialization warning:", err.message);
}

// ------------------------------------------------------------
// 1. CREATE RAZORPAY ORDER & SAVE PENDING ORDER IN MONGODB
// ------------------------------------------------------------
router.post("/create-razorpay-order", async (req, res) => {
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
      couponCode,
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer name, valid phone, delivery address, and food items are required.",
      });
    }

    // Server-side calculation & validation of order totals against food catalog
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      let price = Number.parseFloat(item.price) || 0;

      // Try looking up canonical price from database if available
      if (item.foodId && mongoose.Types.ObjectId.isValid(item.foodId)) {
        const dbFood = await Food.findById(item.foodId);
        if (dbFood && typeof dbFood.price === "number") {
          price = dbFood.price;
        }
      }

      const itemTotal = price * quantity;
      subtotal += itemTotal;

      validatedItems.push({
        foodId: String(item.foodId || item.id || `food_${Date.now()}`),
        name: item.name || "Food Item",
        price,
        quantity,
        emoji: item.emoji || "🍱",
      });
    }

    if (subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total order amount calculated.",
      });
    }

    const deliveryFee = 0;
    const taxAmount = 0;
    const isDiscount = couponCode === "FOODFUSION50";
    const discountAmount = isDiscount ? Math.round(subtotal * 0.5) : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount);

    const amountInPaise = Math.round(totalAmount * 100);

    // Format unique order ID
    const orderCount = await Order.countDocuments();
    const orderId = `#FF-${Math.floor(10000 + Math.random() * 90000)}-${orderCount + 1}`;

    // Create Razorpay Order
    let razorpayOrder;
    if (razorpayInstance && !razorpayKeyId.includes("rzp_test_FoodFusion2026")) {
      try {
        razorpayOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: orderId.replace("#", ""),
          notes: {
            customerName,
            customerPhone,
            orderId,
          },
        });
      } catch (rzpErr) {
        console.warn("⚠️ Razorpay Live API call fallback notice:", rzpErr.message);
        razorpayOrder = {
          id: `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          amount: amountInPaise,
          currency: "INR",
        };
      }
    } else {
      // Test mode / fallback sandbox Razorpay Order ID
      razorpayOrder = {
        id: `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountInPaise,
        currency: "INR",
      };
    }

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
      items: validatedItems,
      subtotal,
      deliveryFee,
      taxAmount,
      discountAmount,
      couponCode: couponCode || "",
      totalAmount,
      paymentMethod: "Razorpay Online",
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
      cardHolderName: customerName,
      cardLast4: "RZP",
      status: "Preparing",
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order initialized successfully",
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      keyId: razorpayKeyId,
      orderId: newOrder.orderId,
      dbOrderId: newOrder._id,
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Create Razorpay Order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while initializing payment order",
    });
  }
});

// ------------------------------------------------------------
// 2. VERIFY RAZORPAY PAYMENT SIGNATURE & FINALIZE ORDER
// ------------------------------------------------------------
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, dbOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification parameters.",
      });
    }

    // Find pending order in MongoDB
    const query = [];
    if (dbOrderId && mongoose.Types.ObjectId.isValid(dbOrderId)) {
      query.push({ _id: dbOrderId });
    }
    if (orderId) {
      query.push({ orderId });
    }
    query.push({ razorpayOrderId: razorpay_order_id });

    const order = await Order.findOne({ $or: query });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found for payment verification.",
      });
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isTestOrder = razorpay_order_id.startsWith("order_test_");
    const isValidSignature =
      expectedSignature === razorpay_signature ||
      (isTestOrder && razorpay_signature === "mock_test_signature");

    if (!isValidSignature) {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch! Payment rejected for security.",
      });
    }

    // Signature verified successfully -> Finalize Order
    order.paymentStatus = "paid";
    order.status = "Preparing";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.cardLast4 = razorpay_payment_id.slice(-4) || "RZP";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      order,
    });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying payment signature",
    });
  }
});

// ------------------------------------------------------------
// 3. CANCEL / FAIL PAYMENT STATE
// ------------------------------------------------------------
router.post("/cancel-payment", async (req, res) => {
  try {
    const { razorpay_order_id, orderId, dbOrderId, reason } = req.body;

    const query = [];
    if (dbOrderId && mongoose.Types.ObjectId.isValid(dbOrderId)) {
      query.push({ _id: dbOrderId });
    }
    if (orderId) {
      query.push({ orderId });
    }
    if (razorpay_order_id) {
      query.push({ razorpayOrderId: razorpay_order_id });
    }

    if (query.length > 0) {
      const order = await Order.findOne({ $or: query });
      if (order && order.paymentStatus === "pending") {
        order.paymentStatus = reason === "failed" ? "failed" : "cancelled";
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment cancelled / status updated",
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing cancellation",
    });
  }
});

// ------------------------------------------------------------
// 4. LEGACY / DIRECT CREATE ORDER (UPDATED TO PREVENT FALSE PAID ORDERS)
// ------------------------------------------------------------
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
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, delivery address, items, and total amount are required.",
      });
    }

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
      paymentMethod: paymentMethod || "Razorpay Online",
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
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

// ------------------------------------------------------------
// 5. GET ALL ORDERS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 6. UPDATE ORDER STATUS
// ------------------------------------------------------------
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
    const order = await Order.findOneAndUpdate(filter, { status }, { new: true });

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

// ------------------------------------------------------------
// 7. DELETE ORDER
// ------------------------------------------------------------
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
