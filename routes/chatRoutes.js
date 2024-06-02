// routes/chatRoutes.js
const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const { authMiddleware } = require('../routes/authMiddleware');

// OpenAI API Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create a new chat session
router.post('/session', authMiddleware, async (req, res) => {
    const session = new Chat({ sessionId: new mongoose.Types.ObjectId(), userId: req.user._id });
    await session.save();
    res.json(session);
});

// Fetch all chat sessions for the authenticated user
router.get('/sessions', authMiddleware, async (req, res) => {
    const sessions = await Chat.find({ userId: req.user._id });
    res.json(sessions);
});

// Fetch chat history for a session
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
    const session = await Chat.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    res.json(session ? session.messages : []);
});

router.post('/session/:sessionId/message', authMiddleware, async (req, res) => {
    const { sender, text } = req.body;
    const session = await Chat.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    
    if (session) {
        const userMessage = { sender, text };
        session.messages.push(userMessage);

        // Set the initial query if not already set
        if (!session.initialQuery) {
            session.initialQuery = text;
        }

        try {
            // Call OpenAI API
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: text },
                ],
            });

            const botMessage = { sender: 'Chatbot', text: response.choices[0].message.content.trim() };
            session.messages.push(botMessage);
            await session.save();

            res.json({ userMessage, botMessage, session });
        } catch (error) {
            console.error('Error creating chat completion:', error);
            res.status(500).json({ message: 'Error creating chat completion', error });
        }
    } else {
        res.status(404).send('Session not found');
    }
});


module.exports = router;
