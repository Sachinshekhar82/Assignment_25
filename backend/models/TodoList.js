const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const todoListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true, default: null },
  },
  { timestamps: true }
);

todoListSchema.methods.ensureShareToken = function ensureShareToken() {
  if (!this.shareToken) {
    this.shareToken = nanoid(12);
  }
  return this.shareToken;
};

module.exports = mongoose.model('TodoList', todoListSchema);
