const express = require('express');
const TodoList = require('../models/TodoList');
const TodoItem = require('../models/TodoItem');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function loadOwnedList(req, res, next) {
  const list = await TodoList.findOne({ _id: req.params.id, owner: req.userId });
  if (!list) return res.status(404).json({ message: 'Todo list not found' });
  req.list = list;
  next();
}

// Create a list
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'List name is required' });
  }
  const list = await TodoList.create({ name: name.trim(), owner: req.userId });
  res.status(201).json({ list });
});

// Get all lists for the logged-in user, each with quick stats
router.get('/', async (req, res) => {
  const lists = await TodoList.find({ owner: req.userId }).sort({ createdAt: 1 });

  const listsWithStats = await Promise.all(
    lists.map(async (list) => {
      const [total, completed] = await Promise.all([
        TodoItem.countDocuments({ list: list._id }),
        TodoItem.countDocuments({ list: list._id, completed: true }),
      ]);
      return {
        ...list.toObject(),
        stats: { total, completed, pending: total - completed },
      };
    })
  );

  res.json({ lists: listsWithStats });
});

// Get a single list
router.get('/:id', loadOwnedList, async (req, res) => {
  res.json({ list: req.list });
});

// Rename a list
router.patch('/:id', loadOwnedList, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'List name is required' });
  }
  req.list.name = name.trim();
  await req.list.save();
  res.json({ list: req.list });
});

// Delete a list (and its items)
router.delete('/:id', loadOwnedList, async (req, res) => {
  await TodoItem.deleteMany({ list: req.list._id });
  await req.list.deleteOne();
  res.json({ message: 'List deleted' });
});

// Stats: completed / pending / total + counts per tag
router.get('/:id/stats', loadOwnedList, async (req, res) => {
  const items = await TodoItem.find({ list: req.list._id });
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const pending = total - completed;

  const tagCounts = {};
  let noTag = 0;
  items.forEach((item) => {
    if (!item.tags || item.tags.length === 0) {
      noTag += 1;
    } else {
      item.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  res.json({
    total,
    completed,
    pending,
    tagCounts,
    noTag,
  });
});

// Generate / return the public share link for a list
router.post('/:id/share', loadOwnedList, async (req, res) => {
  req.list.ensureShareToken();
  req.list.isPublic = true;
  await req.list.save();
  res.json({ list: req.list, shareToken: req.list.shareToken });
});

// Revoke public sharing
router.delete('/:id/share', loadOwnedList, async (req, res) => {
  req.list.isPublic = false;
  await req.list.save();
  res.json({ list: req.list });
});

module.exports = router;
