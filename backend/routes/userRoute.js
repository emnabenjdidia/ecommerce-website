import express from 'express';
import {
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();
router.post('/', createUser);
router.put('/:id', authenticate,updateUser);
router.delete('/:id',authenticate, deleteUser);

export default router;

