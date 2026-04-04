import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const cart = sequelize.define('cart', {
}, { timestamps: false });

export default cart;
