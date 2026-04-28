import express from 'express';
import {
  listProductReviews,
  createReview,
  canReviewProduct,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/product/:productId', listProductReviews);
router.get('/can-review/:productId', protect, canReviewProduct);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
