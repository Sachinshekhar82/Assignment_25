const mongoose = require('mongoose');

const todoItemSchema = new mongoose.Schema(
  {
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoList', required: true, index: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TodoItem', todoItemSchema);
