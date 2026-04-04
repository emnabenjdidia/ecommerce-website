
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const user = sequelize.define('users', {
  
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
  type: DataTypes.STRING,
  defaultValue: 'user', 
  allowNull: false,
},
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
      
  timestamps: true         
});

export default user;
