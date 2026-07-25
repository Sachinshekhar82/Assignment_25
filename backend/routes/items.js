const express = require('express');
const TodoList = require('../models/TodoList');
const TodoItem = require('../models/TodoItem');
const requireAuth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

async function loadOwnedList(req, res, next) {
  const list = await TodoList.findOne({ _id: req.params.listId, owner: req.userId });
  if (!list) return res.status(404).json({ message: 'Todo list not found' });
  req.list = list;
  next();
}

// List items in a list, optionally filtered by tag: /?tag=urgent
router.get('/', loadOwnedList, async (req, res) => {
  const query = { list: req.list._id };
  if (req.query.tag) {
    if (req.query.tag === '__none__') {
      query.tags = { $size: 0 };
    } else {
      query.tags = req.query.tag.toLowerCase();
    }
  }
  const items = await TodoItem.find(query).sort({ order: 1, createdAt: 1 });
  res.json({ items });
});

// Create an item
router.post('/', loadOwnedList, async (req, res) => {
  const { title, tags } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Item title is required' });
  }
  const count = await TodoItem.countDocuments({ list: req.list._id });
  const item = await TodoItem.create({
    list: req.list._id,
    title: title.trim(),
    tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
    order: count,
  });
  res.status(201).json({ item });
});

async function loadOwnedItem(req, res, next) {
  const list = await TodoList.findOne({ _id: req.params.listId, owner: req.userId });
  if (!list) return res.status(404).json({ message: 'Todo list not found' });
  const item = await TodoItem.findOne({ _id: req.params.itemId, list: list._id });
  if (!item) return res.status(404).json({ message: 'Todo item not found' });
  req.item = item;
  next();
}

// Update an item: rename, toggle completed, change tags
router.patch('/:itemId', loadOwnedItem, async (req, res) => {
  const { title, completed, tags } = req.body;
  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ message: 'Title cannot be empty' });
    req.item.title = title.trim();
  }
  if (completed !== undefined) req.item.completed = Boolean(completed);
  if (tags !== undefined) {
    req.item.tags = Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [];
  }
  await req.item.save();
  res.json({ item: req.item });
});

// Delete an item
router.delete('/:itemId', loadOwnedItem, async (req, res) => {
  await req.item.deleteOne();
  res.json({ message: 'Item deleted' });
});

// Reorder items: body = { orderedIds: [id1, id2, ...] }
router.post('/reorder', loadOwnedList, async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'orderedIds must be an array' });
  }
  await Promise.all(
    orderedIds.map((id, index) =>
      TodoItem.updateOne({ _id: id, list: req.list._id }, { order: index })
    )
  );
  const items = await TodoItem.find({ list: req.list._id }).sort({ order: 1 });
  res.json({ items });
});

module.exports = router;
