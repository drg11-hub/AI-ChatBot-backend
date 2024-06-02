// const mongoose = require('mongoose')
// const dbConfig = require('./dbconfig')

// const connectDB = async() => {
//     try {
//         const conn = await mongoose.connect(dbConfig.database, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true, 
//         })
//         await mongoose.set('debug', true);
//         // Above command is useful to know the actual mongoose command processed
//         console.log(`MongoDB Connected: ${conn.connection.host}`)
//     }
//     catch (err) {
//         console.log("DB Connection Error: ",err)
//         process.exit(1)
//     }
// }

// module.exports = connectDB

// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

module.exports = connectDB;