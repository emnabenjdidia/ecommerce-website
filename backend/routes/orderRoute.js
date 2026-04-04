import express from "express";
import {
  createOrder,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

router.post("/", createOrder);
router.delete("/:id",authenticate, deleteOrder);
router.patch("/:orderId/cancel", authenticate, cancelOrder);

export default router;
