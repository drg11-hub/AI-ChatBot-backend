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
    app.use(morgan('dev'))
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json())
// app.use(routes)
// app.use(passport.initialize())

// require('./config/passport')(passport)

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3001

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))