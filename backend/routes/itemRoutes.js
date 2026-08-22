const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single item by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new item (requires login)
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const itemData = { ...req.body, postedBy: req.userId };

    if (req.file) {
      itemData.imageUrl = req.file.path;
    }

    const newItem = new Item(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update) an item (requires login + ownership or admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const user = await User.findById(req.userId);
    const isOwner = item.postedBy.toString() === req.userId;
    const isAdmin = user && user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only update your own items' });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an item (requires login + ownership or admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const user = await User.findById(req.userId);
    const isOwner = item.postedBy.toString() === req.userId;
    const isAdmin = user && user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
