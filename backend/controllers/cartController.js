import cart from "../models/cart.js";
import cartItem from "../models/cartItem.js";
import order from "../models/order.js";
import orderItem from "../models/orderItem.js";
import product from "../models/product.js";
import user from "../models/user.js";

export const addToCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  try {
    // Find user's cart or create one
    let userCart = await cart.findOne({ where: { userId } });
    if (!userCart) {
      userCart = await cart.create({ userId });
    }

    // Check if product already in cart
    let item = await cartItem.findOne({
      where: { cartId: userCart.id, productId },
    });

    if (item) {
      // Increase quantity if exists
      item.quantity += quantity;
      await item.save();
    } else {
      // Create new cart item if not exists
      item = await cartItem.create({
        cartId: userCart.id,
        productId,
        quantity,
      });
    }

    res.status(200).json({ message: "Item added to cart", item });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

export const getCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const userCart = await cart.findOne({
      where: { UserId: userId },
      include: {
        model: cartItem,
        include: product,
      },
    });

    if (!userCart) return res.json({ items: [] });

    res.json(userCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const item = await cartItem.findByPk(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = quantity;
    await item.save();

    res.json({ message: "Quantity updated", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

export const deleteCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await cartItem.findByPk(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    await item.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};
export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Find the user's cart
    const userCart = await cart.findOne({ where: { userId } });
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Delete all items from that cart
    await cartItem.destroy({ where: { cartId: userCart.id } });

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Failed to clear cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

export const checkout = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. Find user's cart
    const userCart = await cart.findOne({ where: { userId } });

    if (!userCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // 2. Get cart items with product details
    const items = await cartItem.findAll({
      where: { cartId: userCart.id },
      include: product,
    });

    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    for (const item of items) {
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          error: `Not enough stock for product: ${item.product.name}`,
          available: item.product.quantity,
          requested: item.quantity,
        });
      }
    }

    // 3. Calculate total
    let total = 0;
    for (const item of items) {
      total += item.quantity * item.product.price;
    }

    // 4. Create order
    const newOrder = await order.create({
      userId,
      total,
      status: "pending",
    });

    // 5. Create order items
    for (const item of items) {
      await orderItem.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
      // 6. Reduce product stock
      const productToUpdate = await product.findByPk(item.productId);

      if (productToUpdate) {
        productToUpdate.quantity -= item.quantity;

        await productToUpdate.save();
      }
    }

    // 7. Clear cart
    await cartItem.destroy({ where: { cartId: userCart.id } });

    res.status(201).json({ message: "Checkout successful", order: newOrder });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
};
