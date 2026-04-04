import user from "./user.js";
import product from "./product.js";
import order from "./order.js";
import orderItem from "./orderItem.js";
import cart from "./cart.js";
import cartItem from "./cartItem.js";

// User - Order
user.hasMany(order, { foreignKey: "userId" });
order.belongsTo(user, { foreignKey: "userId" });

// Order - OrderItem
order.hasMany(orderItem, { foreignKey: 'orderId', as: 'orderItems' });
orderItem.belongsTo(order, { foreignKey: 'orderId' });

// Product - OrderItem
product.hasMany(orderItem, { foreignKey: "productId" });
orderItem.belongsTo(product, { foreignKey: "productId" });

// User - Cart (One to One)
user.hasOne(cart, { foreignKey: "userId" });
cart.belongsTo(user, { foreignKey: "userId" });

// Cart - CartItem (One to Many)
cart.hasMany(cartItem, { foreignKey: "cartId" });
cartItem.belongsTo(cart, { foreignKey: "cartId" });

// Product - CartItem (Many to One)
product.hasMany(cartItem, { foreignKey: "productId" });
cartItem.belongsTo(product, { foreignKey: "productId" });

export { user, product, order, orderItem, cart, cartItem };
