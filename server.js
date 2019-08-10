const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const bodyParser = require('body-parser');
const cors = require('cors');

// const signIn = require('./controllers/signIn');
const auth = require('./controllers/auth');
const list = require('./controllers/list');
const messages = require('./controllers/messages');


/* Section 1 */
// const db = knex({
// 	client : 'mssql',
// 	connection : {
// 		server : 'chime.database.windows.net',
// 		user: 'rsvpmx',
// 		password: 'qwockeD1',
// 		options: {

// 		}
// 	}
// });

// /* Section 2 */
const db = knex({
	client : 'pg',
	connection : {
		host : '127.0.0.1',
		user : 'postgres',
		password : '',
		database : 'chime',
	} 
});


const app = express();
app.use(cors());

/* Body parser to parse json */
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));


/* API routes */
app.get('/', (req, res) => { res.send('Server is up'); });

app.post('/register', (req, res) => { auth.handleRegister(req, res, db, bcrypt) });
app.post('/signIn', (req, res) => { auth.handleSignIn(req, res, db, bcrypt) });

app.post('/sendMessage', (req, res) => { messages.handleSendMessage(req, res, db, bcrypt)});
app.post('/fetchMessages', (req, res) => { messages.handleFetchMessages(req, res, db, bcrypt)});

app.get('/getList', (req, res) => { list.handleGetList(req, res, db, bcrypt)});

app.listen(3001, () => {
	console.log('Server started');
});

