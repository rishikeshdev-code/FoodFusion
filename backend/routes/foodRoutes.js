const express = require("express");
const Food = require("../models/food");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({
      available: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching foods",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (_error) {
    res.status(400).json({
      success: false,
      message: "Invalid food ID",
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      message: "Food added successfully",
      food,
    });
  } catch (error) {
    console.error("Add food error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding food",
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (_error) {
    res.status(400).json({
      success: false,
      message: "Unable to update food",
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (_error) {
    res.status(400).json({
      success: false,
      message: "Unable to delete food",
    });
  }
});

module.exports = router;