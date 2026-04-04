import order from '../models/order.js';
import orderItem from '../models/orderItem.js';
import product from '../models/product.js';
// create product
export const createOrder = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid order input" });
  }

  try {
    let totalPrice = 0;
    const orderItems = [];

    
    for (let item of items) {
      const prod = await product.findByPk(item.productId);

      if (!prod) {
        return res.status(404).json({ error: `Product ID ${item.productId} not found` });
      }

      if (prod.quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for product: ${prod.name}` });
      }

      totalPrice += prod.price * item.quantity;

      orderItems.push({
        productId: prod.id,
        quantity: item.quantity,
        price: prod.price,
      });
    }
    const newOrder = await order.create({
      userId,
       total: totalPrice,
      status: "pending",
       paymentStatus: "unpaid"
    });


    orderItems.forEach((item) => {
      item.orderId = newOrder.id;
    });

    await orderItem.bulkCreate(orderItems);

    
    for (let item of items) {
      const prod = await product.findByPk(item.productId);
      prod.quantity -= item.quantity;
      await prod.save();
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};


// deleteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
export const deleteOrder = async (req, res) => {
  try {
    const deleteorder = await order.findByPk(req.params.id);
    if (!deleteorder) return res.status(404).json({ error: "Order not found" });

    await deleteorder.destroy();
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

// Cancel an order and restore stock
export const cancelOrder = async (req, res) => {
  const userId = req.user.userId;
  const { orderId } = req.params;

  try {
    // Get the order
    const ord = await order.findByPk(orderId, {
     include: {
    model: orderItem,
    as: 'orderItems' 
  }
    });

    if (!ord) return res.status(404).json({ error: 'Order not found' });

    // Only the owner or admin can cancel
    if (ord.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }

    // Only cancel if not already cancelled
    if (ord.status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    // Restore stock
    for (const item of ord.orderItems) {
      const prod = await product.findByPk(item.productId);
      if (prod) {
        prod.quantity += item.quantity;
        await prod.save();
      }
    }

    // Update order status
    ord.status = 'cancelled';
    await ord.save();

    res.json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};




