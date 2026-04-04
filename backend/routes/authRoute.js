import express from 'express';
import { register, login,getCurrentUser } from '../controllers/authController.js';
import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", authenticate, getCurrentUser);


export default router;
