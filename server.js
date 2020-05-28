const express = require('express')
const bcrypt = require('bcrypt-nodejs')
const bodyParser = require('body-parser')
const cors = require('cors')
const knex = require('knex')
const dotenv = require('dotenv')

const dbHandler = require('./database')
const auth = require('./controllers/auth')
const list = require('./controllers/list')
const users = require('./controllers/users')
const profile = require('./controllers/profile')
const messages = require('./controllers/messages')

dotenv.config()

const app = express()
app.use(cors())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const db = knex({
	client : 'pg',
	connection : {
		connectionString : process.env.DATABASE_URL,
		ssl : true,
	}
})

dbHandler.setUpDB(db).then(console.log('All tables set up'))
.catch(() => console.log('Problem setting up databases'))

/* Body parser to parse json */
app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

/* API routes */
app.get('/', (req, res) => { res.status(200).json({code :'Server is up'}) })

app.post('/auth/register', (req, res) => { auth.handleRegister(req, res, bcrypt, db) })
app.post('/auth/login', (req, res) => { auth.handleSignIn(req, res, bcrypt, db) })

app.get('/users', (req, res) => { list.handleGetList(req, res, db)})

app.delete('/users', (req, res) => { users.handleDeleteUser(req, res, bcrypt, db)})

app.post('/messages/send', (req, res) => { messages.handleSendMessage(req, res, bcrypt, db)})
app.post('/messages/fetch', (req, res) => { messages.handleFetchMessages(req, res, bcrypt, db)})

app.get('/profile', (req, res) => { profile.handleGetProfile(req, res, db)})
app.put('/profile', (req, res) => { profile.handleSaveProfile(req, res, bcrypt, db)})

app.listen(process.env.PORT || 3001, () => {
	console.log('Server started')
})

