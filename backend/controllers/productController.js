import product from "../models/product.js";

// POST /api/products

export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, category, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price || !category || !quantity) {
      return res
        .status(400)
        .json({ error: "Name,price,category and quantity are required" });
    }

    const newProduct = await product.create({
      name,
      description,
      price,
      imageUrl,
      category,
      quantity,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await product.findAll();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const foundProduct = await product.findByPk(req.params.id);
    if (!foundProduct)
      return res.status(404).json({ error: "Product not found" });
    res.json(foundProduct);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// update by id
export const updateProductByName = async (req, res) => {
  const { name, price, description, category, quantity } = req.body;
  const image = req.file;

  try {
    const productUpdated = await product.findOne({ where: { name } });

    if (!productUpdated) {
      return res.status(404).json({ error: "No product found with that name" });
    }

    // Update fields if provided
    if (price) productUpdated.price = price;
    if (description) productUpdated.description = description;
    if (category) productUpdated.category = category;
    if (quantity) productUpdated.quantity = quantity;
    if (image) {
      productUpdated.imageUrl = `/uploads/${image.filename}`;
    }

    await productUpdated.save();

    res.json({ message: "Product updated successfully", productUpdated });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Server error while updating product" });
  }
};

// delete by id
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const foundProduct = await product.findByPk(req.params.id);
    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await foundProduct.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
