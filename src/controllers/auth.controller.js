import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatar: u.avatar,
  role: u.role,
  addresses: u.addresses,
  wishlist: u.wishlist,
});

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password, phone });
  res.status(201).json({
    success: true,
    user: sanitize(user),
    token: generateToken(user._id),
  });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account deactivated');
  }
  user.lastLogin = new Date();
  await user.save();
  res.json({
    success: true,
    user: sanitize(user),
    token: generateToken(user._id),
  });
});

// @route GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ success: true, user: sanitize(user) });
});

// @route PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, phone, avatar, password } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (password) user.password = password;
  await user.save();
  res.json({ success: true, user: sanitize(user) });
});

/* -------- Addresses -------- */
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) {
    res.status(404);
    throw new Error('Address not found');
  }
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull({ _id: req.params.id });
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

/* -------- Wishlist -------- */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.productId;
  const i = user.wishlist.findIndex((p) => p.toString() === id);
  if (i > -1) user.wishlist.splice(i, 1);
  else user.wishlist.push(id);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});
