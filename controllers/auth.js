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
const handleRegister = (req, res, bcrypt) => {

    const { username, first, last, password } = req.body;

    if (!username || !first || !last || !password) {
        return res.status(400).json({ code : 3 });
    }
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
        .query('select * from login')
        .then(result => {
            sql.close();
            validateUserWithUsername(bcrypt, username, password)
            .then(isValid => {
                if (isValid) {
                    return res.json({ code: 0 });
                }
                else {
                    return res.json({ code: 1 });
                }
            })
        })
    })


    // sql.
	/* Destructure request body */

	// db.select('username').from('login')
	// .where('username','=', username)
	// .then(data => {
		
	// 	/* If username already exists, send error code back to front-end */
	// 	if (data.length !== 0) {
	// 		return res.send({ code : 2 });
	// 	}
	// 	else {

	// 		/* Synchronous hashing */
	// 		const hash = bcrypt.hashSync(password);

	// 		/* Transaction for consistency */
	// 		db.transaction(trx => {

	// 			const lastSeen = ((new Date).getTime()).toString();
				
	// 			/* First insert into login table */
	// 			trx.insert({
	// 				hash : hash,
	// 				username : username,
	// 				lastseen : lastSeen
	// 			})
	// 			.into('login')
	// 			.returning('*')
	// 			.then(user => {
	// 				return trx('profile')
	// 				.returning('*')
	// 				.insert({
    //                     username: username,
    //                     first: first,
    //                     last: last,
	// 					picture: 'https://i.imgur.com/FSgbIi4.png'
	// 				})
    //                 /* On successful API call, return the user object to the front-end */
    //                 .then(user => {
    //                     return res.status(200).json({ code : 0, 
    //                                                     user: {
	// 														username: username,
    //                                                         first : user[0].first, 
    //                                                         last : user[0].last, 
    //                                                         picture : user[0].picture
    //                                                     } 
    //                     });
    //                 });
	// 			})
	// 			/* Commit changes */
	// 			.then(trx.commit)
	// 			/* Delete transaction if failed anywhere */
	// 			.catch(trx.rollback)
	// 		})
	// 		/* Return error code if failed */
	// 		.catch(err => res.json({ code : 4 }));	
	// 	}
	// });
}


// /**
//  * 
//  * This API handler takes 2 parameters via request body
//  * 1 - username: string
//  * 2 - password: string
//  * 
//  * Returns
//  * 1: code: number - indicates if the API call was successful
//  * 2: user object: {
//  * 		username: string,
//  *      first: string,
//  *      last: string,
//  *      picture: string
//  * }
//  */
// const handleSignIn = (req, res, db, bcrypt) => {
	
// 	/* Destructure request body */
// 	const { username, password } = req.body;
// 	if (!(username && password)) {
// 		return res.status(400).json({ code : 3 });
// 	}
// 	validateUserWithUsername(db, bcrypt, username, password)
// 	.then(isValid => {
// 		if (isValid) {
// 			updateLastSeen(db, username)
// 			.then(() => {
// 				getProfile(db, username)
// 				.then(profile => {
// 					return res.send({ 
// 						code: 0, 
// 						user : {
// 							username: username,
// 							first : profile.first, 
// 							last : profile.last, 
// 							picture : profile.picture
// 						}		 
// 					});
					
// 				})
// 				.catch(err => {
// 					return res.status(200).json({ code : 4 });
// 				})
// 			})
// 		}
// 		/* On password mismatch, send the error code to the front-end */
// 		else {
// 			return res.json({ code : 1 });
// 		}
// 	})
// }

// const getProfile = async(db, username) => {

//     const profile = await db.select('first', 'last', 'picture').from('profile').where('username','=',username);    
// 	return profile[0];
// }

// const updateLastSeen = (db, username) => {

//     return new Promise((resolve, reject) => {
//         const timeNow = (new Date).getTime().toString();
//         db('login').update({ lastseen : timeNow })
//         .where('username','=',username)
//         .then(() => {
//             resolve();
//         })
//         .catch(err => {
//             reject();
//         })
//     })
// }


const validateUserWithUsername = (bcrypt, username, password) => {

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

    return new Promise((resolve, reject) => {
        const sql = require('mssql');
        sql.connect(config).then(pool => {
            return pool.request()
            .input('username', sql.VarChar, username)
            .query(`select hash from login where username = '${username}'`)
            .then(result => {

                const user = result.recordset[0];
                /* Use synchronous hash compare */
                const isValid = bcrypt.compareSync(password,user.hash);
                sql.close();
                resolve(isValid);
            })
        })
    })

    // return new Promise((resolve, reject) => {
    //     db.select('hash').from('login')
    //     .where('username','=', username)
    //     .then(user => {
    //         if (user.length !== 0) {
    //             /* Use synchronous hash compare */
    //             const isValid = bcrypt.compareSync(password,user[0].hash);
    //             resolve(isValid);
	// 		}
	// 		else {
	// 			resolve(false);
	// 		}
    //     })
    //     .catch(err => {
	// 		console.log(err);
	// 		reject(false);
			
    //     })
    // })
    
}


module.exports = {
    handleRegister : handleRegister,
    // handleSignIn : handleSignIn,
    // validateUserWithUsername: validateUserWithUsername
}