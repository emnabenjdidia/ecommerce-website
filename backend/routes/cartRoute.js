import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  checkout,
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", authenticate, addToCart);
router.get("/", authenticate, getCart);
router.patch("/:itemId", authenticate, updateCartItem);
router.delete("/clear", authenticate, clearCart);
router.delete("/:itemId", authenticate, deleteCartItem);
router.post("/checkout", authenticate, checkout);
export default router;
