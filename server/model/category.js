const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  icon: {
    type: String,
    default: '',
    trim: true,
  },
  color: {
    type: String,
    default: '',
    trim: true,
  },
  count: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
