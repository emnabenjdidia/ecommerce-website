import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const order = sequelize.define('orders', {
    userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', 
  },
  paymentStatus: {
  type: DataTypes.ENUM('paid', 'unpaid'),
  defaultValue: 'unpaid',
  allowNull: false
},

});

export default order;
