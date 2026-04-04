import express from "express";
import {
  getUsersWithOrders,
  updateOrderStatus,
  getAdminSummary, 
  filterOrders,
  markOrderAsPaid
} from "../controllers/adminController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";
const router = express.Router();

router.patch("/:id/status", authenticate, isAdmin, updateOrderStatus);
router.get('/summary', authenticate, isAdmin, getAdminSummary);
router.get('/orders', authenticate, isAdmin, filterOrders);
router.patch('/pay/:orderId', authenticate, markOrderAsPaid);
router.get("/users-with-orders", authenticate, isAdmin, getUsersWithOrders);
export default router;
