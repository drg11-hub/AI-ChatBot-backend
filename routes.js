const express = require('express')
// const actions = require('../methods/actions')
const router = express.Router()
// const multer = require('multer');
// const mongodb = require('mongodb');
var fs = require('fs');

// import logIn from './routes/authroutes';

router.get('/health', (req, res) => {
    res.send('OK')
});


// router.post('/logIn', logIn)
// router.post('/authenticate', authenticate)

module.exports = router