const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const passport = require('passport')
const bodyParser = require('body-parser')
const authRoutes = require('./routes/authRoutes')
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');


dotenv.config();

connectDB()

const app = express()

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'))
}

// app.use(cors())
const corsOptions = {
    origin: 'https://aichatbot-243h.onrender.com', // Replace with your frontend URL if different
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json())
// app.use(routes)
// app.use(passport.initialize())

// require('./config/passport')(passport)

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Add this route for the root URL
app.get('/', (req, res) => {
    res.send('AI-ChatBot Backend Running!')
})

const PORT = process.env.PORT || 3001

app.listen(PORT, console.log(`AI-ChatBot Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))