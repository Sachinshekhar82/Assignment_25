const express = require('express');
const TodoList = require('../models/TodoList');
const TodoItem = require('../models/TodoItem');

const router = express.Router();

// Public, read-only view of a shared list by its share token
router.get('/:token', async (req, res) => {
  const list = await TodoList.findOne({ shareToken: req.params.token, isPublic: true }).populate(
    'owner',
    'name'
  );
  if (!list) {
    return res.status(404).json({ message: 'This shared list was not found or is no longer public' });
  }
  const items = await TodoItem.find({ list: list._id }).sort({ order: 1, createdAt: 1 });
  res.json({ list, items });
});

module.exports = router;
