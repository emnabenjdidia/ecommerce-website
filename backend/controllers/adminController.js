import user from "../models/user.js";
import "../models/relations.js";
import order from "../models/order.js";
import orderItem from "../models/orderItem.js";
import product from "../models/product.js";

import { Op } from "sequelize";
export const getUsersWithOrders = async (req, res) => {
  try {
    const users = await user.findAll({
      attributes: { exclude: ["password"] },
      include: {
        model: order,
        include: {
          model: orderItem,
          as: "orderItems", 
          include: product,
        },
      },
    });
    res.json(users);
  } catch (err) {
    console.error("🔥 getUsersWithOrders Error:", err);
    res.status(500).json({
      error: "Failed to fetch users and orders",
      details: err.message,
    });
  }
};

// update status of order

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ord = await order.findByPk(id);
    if (!ord) return res.status(404).json({ error: "Order not found" });
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    ord.status = status;
    await ord.save();

    res.json(ord);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await user.count();
    const totalOrders = await order.count();

    const totalRevenue = await order.sum("total", {
      where: {
        status: {
          [Op.in]: ["shipped", "delivered"],
        },
      },
    });

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

export const filterOrders = async (req, res) => {
  const { status, paymentStatus, startDate, endDate } = req.query;

  const where = {};
  if (status) {
    where.status = status;
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  try {
    const orders = await order.findAll({
      where,

      include: [
        {
          model: user,
          attributes: ["id", "username", "email"],
        },
        {
          model: orderItem,
          as: "orderItems",
          include: [product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (err) {
    console.log("Filter Orders Error:", err);
    res.status(500).json({ error: "Failed to filter orders" });
  }
};

export const markOrderAsPaid = async (req, res) => {
  const { orderId } = req.params;

  try {
    const targetOrder = await order.findByPk(orderId);

    if (!targetOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    targetOrder.paymentStatus = "paid";
    await targetOrder.save();

    res
      .status(200)
      .json({ message: "Order marked as paid", order: targetOrder });
  } catch (err) {
    console.error("Payment Update Error:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
