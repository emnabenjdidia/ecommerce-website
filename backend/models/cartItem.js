import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const cartItem = sequelize.define('cartItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
}, { timestamps: false });

export default cartItem;
