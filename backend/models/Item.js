const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  contactInfo: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);

