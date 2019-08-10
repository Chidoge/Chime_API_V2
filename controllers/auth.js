const db = require('./config');

/**
 * 
 * This API handler takes 4 parameters via request body
 * 1 - username: string
 * 2 - first: string
 * 3 - last: string
 * 4: password: string
 * 
 * Returns
 * 1: code: number - indicates if the API call was successful
 * 2: user object: {
 * 		username: string,
 *      first: string,
 *      last: string,
 *      picture: string
 * }
 */
const handleRegister = (req, res, bcrypt , db) => {

    const { username, first, last, password } = req.body;

    if (!username || !first || !last || !password) {
        return res.status(400).json({ code : 3 });
    }
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

    const sql = require('mssql');
    sql.connect(config).then(pool => {
        return pool.request()
        .query(`select username from login where username = '${username}'`)
        .then(result => {
            sql.close();
            if (result.recordset.length !== 0) {
                return res.json({ code: 2 });
            }
            else {
                /* Synchronous hashing */
                const hash = bcrypt.hashSync(password);
                const lastSeen = ((new Date).getTime()).toString();
                sql.connect(config).then(pool => {
                    return pool.request()
                    .query(`insert into login (hash, username, lastseen) values ('${hash}', '${username}', '${lastSeen}');`)
                    .then(result => {
                        sql.close()
                        sql.connect(config).then(pool => {
                            return pool.request()
                            .query(`insert into profile (username, first, last, picture) values ('${username}', '${first}', '${last}', '${'https://i.imgur.com/FSgbIi4.png'}');`)
                            .then(result => {
                                return res.status(200).json({ code : 0, 
                                    user: {
                                        username: username,
                                        first : first, 
                                        last : last, 
                                        picture : picture
                                    }}) 
                            })
                        })
                    })
                })
            }
        })
    })
}


/**
 * 
 * This API handler takes 2 parameters via request body
 * 1 - username: string
 * 2 - password: string
 * 
 * Returns
 * 1: code: number - indicates if the API call was successful
 * 2: user object: {
 * 		username: string,
 *      first: string,
 *      last: string,
 *      picture: string
 * }
 */
const handleSignIn = (req, res, bcrypt) => {
	
	/* Destructure request body */
	const { username, password } = req.body;
	if (!(username && password)) {
		return res.json({ code : 3 });
    }

	validateUserWithUsername(bcrypt, username, password)
	.then(isValid => {
		if (isValid) {
			updateLastSeen(username)
			.then(() => {
				getProfile(username)
				.then(profile => {
					return res.send({ 
						code: 0, 
						user : {
							username: username,
							first : profile.first, 
							last : profile.last, 
							picture : profile.picture
						}		 
					});
					
				})
				.catch(err => {
                    console.log(err);
					return res.status(200).json({ code : 4 });
				})
			})
		}
		/* On password mismatch, send the error code to the front-end */
		else {
			return res.json({ code : 1 });
		}
	})
}

const getProfile = (username) => {

    return new Promise((resolve, reject) => {
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

        const sql = require('mssql');
        sql.connect(config).then(pool => {
            return pool.request()
            .input('username', sql.VarChar, username)
            .query(`select * from profile where username = '${username}'`)
            .then(result => {
                sql.close();
                const profile = result.recordset[0];
                resolve(profile);
            })
        })
    })
}

const updateLastSeen = (username) => {

    return new Promise((resolve, reject) => {
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
    
        const sql = require('mssql');
        const timeNow = (new Date).getTime();
        sql.connect(config).then(pool => {
            return pool.request()
            .query(`update login set lastseen = '${timeNow}' where username = '${username}'`)
            .then(result => {
                sql.close();
                resolve(true);
            })
        })
    })
}


const validateUserWithUsername = (bcrypt, username, password) => {

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

    return new Promise((resolve, reject) => {
        const sql = require('mssql');
        sql.connect(config).then(pool => {
            return pool.request()
            .input('username', sql.VarChar, username)
            .query(`select hash from login where username = '${username}'`)
            .then(result => {
                sql.close();
                if (result.recordset.length !== 0) {
                    const user = result.recordset[0];
                    /* Use synchronous hash compare */
                    const isValid = bcrypt.compareSync(password,user.hash);
                    resolve(isValid);
                }
                else {
                    resolve(false);
                }
            })
        })
    })
    
}


module.exports = {
    handleRegister : handleRegister,
    handleSignIn : handleSignIn,
    validateUserWithUsername: validateUserWithUsername
}