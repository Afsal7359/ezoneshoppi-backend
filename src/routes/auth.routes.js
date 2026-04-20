import express from 'express';
import {
  register,
  login,
  me,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
