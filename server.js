const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const cors = require('cors');

const auth = require('./controllers/auth');
const list = require('./controllers/list');
const messages = require('./controllers/messages');

const app = express();
app.use(cors());

/* Body parser to parse json */
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));


/* API routes */
app.get('/', (req, res) => { res.json({code :'Server is up'}); });

app.post('/register', (req, res) => { auth.handleRegister(req, res, bcrypt) });
app.post('/signIn', (req, res) => { auth.handleSignIn(req, res, bcrypt) });

// app.post('/sendMessage', (req, res) => { messages.handleSendMessage(req, res, db, bcrypt)});
// app.post('/fetchMessages', (req, res) => { messages.handleFetchMessages(req, res, db, bcrypt)});

// app.get('/getList', (req, res) => { list.handleGetList(req, res, db, bcrypt)});

app.listen(process.env.PORT || 3001, () => {
	console.log('Server started');
});

