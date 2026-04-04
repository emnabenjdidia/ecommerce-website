import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductByName,
  deleteProduct,
} from "../controllers/productController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

router.post("/", authenticate, isAdmin, upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put(
  "/update-by-name",
  authenticate,
  isAdmin,
  upload.single("image"),
  updateProductByName
);
router.delete("/:id", authenticate, deleteProduct);

export default router;
