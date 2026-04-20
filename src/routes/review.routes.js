import express from 'express';
import {
  listProductReviews,
  createReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/product/:productId', listProductReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
