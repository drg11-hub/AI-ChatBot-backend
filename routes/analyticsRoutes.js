const express = require('express');
const Chat = require('../models/Chat');
const { authMiddleware } = require('../routes/authMiddleware');
const router = express.Router();
const moment = require('moment');

// Get messages count per day for the past week
router.get('/messagesPerDay', authMiddleware, async (req, res) => {
    try {
        const oneWeekAgo = moment().subtract(7, 'days').toDate();

        const messagesPerDay = await Chat.aggregate([
            { $match: { userId: req.user._id, 'messages.timestamp': { $gte: oneWeekAgo } } },
            { $unwind: '$messages' },
            { $match: { 'messages.timestamp': { $gte: oneWeekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.timestamp' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);

        res.json(messagesPerDay);
    } catch (error) {
        res.status(500).json({ errors: ['Server error'] });
    }
});

// Get average response times
router.get('/responseTime', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id });
        const responseTimes = chats.map(chat => {
            const times = chat.messages
                .filter(msg => msg.sender === 'Chatbot')
                .map((msg, index, arr) => {
                    if (index === 0) return null;
                    const prevMsg = arr[index - 1];
                    return msg.timestamp - prevMsg.timestamp;
                })
                .filter(time => time !== null);
            const averageTime = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
            return {
                sessionId: chat.sessionId,
                averageResponseTime: averageTime
            };
        });

        res.json(responseTimes);
    } catch (error) {
        res.status(500).json({ errors: ['Server error'] });
    }
});

module.exports = router;