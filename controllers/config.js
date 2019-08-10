const config = {
    user: 'rsvpmx',
    password: 'qwockeD1',
    server: 'chime.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'chime',
    port: 1433,
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

module.exports = {
	config : config
}