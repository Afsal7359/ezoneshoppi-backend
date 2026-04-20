import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

export const getSettings = asyncHandler(async (_req, res) => {
  let s = await Setting.findOne({ key: 'main' });
  if (!s) s = await Setting.create({ key: 'main' });
  res.json({ success: true, settings: s });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const s = await Setting.findOneAndUpdate(
    { key: 'main' },
    { ...req.body, key: 'main' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, settings: s });
});
