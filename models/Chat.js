// models/Chat.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    sender: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: String,
    initialQuery: { type: String, default: '' },
    messages: [messageSchema],
});


const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
