import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const recomputeRating = async (productId) => {
  const agg = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

export const listProductReviews = asyncHandler(async (req, res) => {
  const items = await Review.find({ product: req.params.productId, isApproved: true })
    .select('name rating title comment isVerifiedPurchase createdAt images')
    .sort({ createdAt: -1 })
    .lean();
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({ success: true, items });
});

export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;
  const existing = await Review.findOne({ product, user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': product,
    paymentStatus: 'paid',
  });
  const r = await Review.create({
    product,
    user: req.user._id,
    name: req.user.name,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!hasPurchased,
  });
  await recomputeRating(r.product);
  res.status(201).json({ success: true, review: r });
});

export const canReviewProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    paymentStatus: 'paid',
  });
  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
  res.json({
    success: true,
    canReview: !!hasPurchased && !alreadyReviewed,
    hasPurchased: !!hasPurchased,
    alreadyReviewed: !!alreadyReviewed,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (req.user.role !== 'admin' && String(r.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden');
  }
  const pid = r.product;
  await r.deleteOne();
  await recomputeRating(pid);
  res.json({ success: true });
});
