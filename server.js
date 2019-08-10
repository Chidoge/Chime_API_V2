const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const cors = require('cors');

const auth = require('./controllers/auth');
const list = require('./controllers/list');
const messages = require('./controllers/messages');

const sql = require('mssql');

const app = express();
app.use(cors());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const config = {
	user: 'rsvpmx',
	password: 'qwockeD1',
	server: 'chime.database.windows.net', 
	database: 'chime',
	port: 1433,
	options: {
		encrypt: true
	}
}


const pool = new sql.ConnectionPool(config, err => {
	if (err) {
		console.log(err);
	}
	else {
		console.log("Connected to database successfully");
	}
})

/* Body parser to parse json */
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));


/* API routes */
app.get('/', (req, res) => { res.json({code :'Server is up'}); });

app.post('/auth/register', (req, res) => { auth.handleRegister(req, res, bcrypt, pool) });
app.post('/auth/login', (req, res) => { auth.handleSignIn(req, res, bcrypt, pool) });

app.get('/users', (req, res) => { list.handleGetList(req, res, pool)});


app.post('/messages/send', (req, res) => { messages.handleSendMessage(req, res, bcrypt, pool)});
app.post('/messages/fetch', (req, res) => { messages.handleFetchMessages(req, res, bcrypt, pool)});



app.listen(process.env.PORT || 3001, () => {
	console.log('Server started');
});

