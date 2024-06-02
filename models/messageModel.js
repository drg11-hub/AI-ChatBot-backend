// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
