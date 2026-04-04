import './loadEnv.js';
import cors from 'cors';
import express from "express";
import './models/relations.js';
import sequelize from "./config/db.js";
import product from'./models/product.js';
import authRoute from './routes/authRoute.js';
import userRoutes from "./routes/userRoute.js";
import productRoutes from './routes/productRoute.js';
import orderRoutes from './routes/orderRoute.js';
import adminRoutes from './routes/adminRoute.js';
import cartRoute from './routes/cartRoute.js';
import orderItem from './models/orderItem.js';
import order from './models/order.js';
import user from './models/user.js';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, '../front')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());



/*--------------------------------------------------------------------------
                       routesssssssssssssss
    -------------------------------------------------------------------*/
// route of  userrrrrrrrrrrrrr


app.use("/api/users", userRoutes); 

// route for product


app.use('/api/products', productRoutes);
  

// route for order 

app.use('/api/orders', orderRoutes);

// route for admin 
app.use('/api/admin', adminRoutes);
// route for  cart 

app.use('/api/cart', cartRoute);
// route for auth

app.use('/api/auth', authRoute);

// connect to data base
app.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log(
      " Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error(" Unable to connect to the database:", error);
  }
});
// creatinggggggggggggg tables
try {
  await sequelize.sync({  alter: true});
  console.log(" All models synced to DB");
} catch (err) {
  console.error(" Sync error:", err);
}

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
