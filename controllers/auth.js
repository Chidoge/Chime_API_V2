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

    const { username, first, last, password } = req.body

    if (!username || !first || !last || !password) {
        return res.status(400).json({ code : 3 })
    }

    db.select('username').from('auth')
    .where('username', '=', username)
    .then(data => {
        if (data != "") {
            if (data[0].username) {
                return res.status(403).json({ code: 2 })
            }
        }
        else {
            /* Synchronous hashing */
            const hash = bcrypt.hashSync(password)
            
            /* Transaction for consistency */
			db.transaction(trx => {
				const lastSeen = ((new Date).getTime()).toString()
				
				/* First insert into login table */
				trx.insert({
                    hash,
                    username,
					lastSeen
				})
				.into('auth')
				.returning('username')
				.then(username => {
					return trx('profile')
					.returning('*')
					.insert({
                        username : username[0],
                        first,
                        last,
						picture: 'https://i.imgur.com/FSgbIi4.png'
					})
					.then(user => {
						/* On successful API call, return the user object to the front-end */
                        return res.status(200).json({ code : 0, 
                                                        user: {
                                                            first : user[0].first, 
                                                            last : user[0].last, 
                                                            id : user[0].id, 
                                                            picture : 'https://i.imgur.com/FSgbIi4.png'
                                                        } 
                        })
					})
				})
				/* Commit changes */
				.then(trx.commit)
				/* Delete transaction if failed anywhere */
				.catch(trx.rollback)
			})
			/* Return db error code if failed */
			.catch(err => {
                console.log(err)
                res.json({ code : 4 })
            })	
        }
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
const handleSignIn = (req, res, bcrypt, db) => {
	
	/* Destructure request body */
	const { username, password } = req.body
	if (!(username && password)) {
		return res.status(400).json({ code : 3 })
    }

	validateUserWithUsername(db, bcrypt, username, password)
	.then(isValid => {
		if (isValid) {
			updateLastSeen(db, username)
			.then(() => {
				getProfile(db, username)
				.then(profile => {
                    /* Profile must exist after validation*/
					return res.status(200).json({
						code: 0, 
						user : {
							username,
							first : profile.first, 
							last : profile.last, 
							picture : profile.picture
						}		 
					})
				})
				.catch(err => {
                    return res.status(500).json({ code: 4 })
				})
			})
		}
		/* On password mismatch, send the error code to the front-end */
		else {
			return res.status(403).json({ code : 1 })
		}
	})
}

const getProfile = (db, username) => {
    return new Promise((resolve, reject) => {
        db.select('*').from('profile')
        .where('username', '=', username)
        .then(profile => {
            resolve(profile[0])
        })
        .catch(err => reject(err))
    })
}

const updateLastSeen = async (db, username) => {
    const timeNow = (new Date).getTime()
    try {
        await db('auth').update({ lastSeen: `${timeNow}` }).where('username', '=', username)
    }
    catch (err) {
        throw err
    }
}

const validateUserWithUsername = (db, bcrypt, username, password) => {
    return new Promise((resolve, reject) => {
        db.select('hash').from('auth')
        .where('username', '=', username)
        .then(result => {
            if (result != "") {
                const user = result[0]
                /* Use synchronous hash compare */
                const isValid = bcrypt.compareSync(password,user.hash)
                resolve(isValid)
            }
            else {
                resolve(false)
            }
        })
    })
}

module.exports = {
    handleRegister : handleRegister,
    handleSignIn : handleSignIn,
    updateLastSeen: updateLastSeen,
    validateUserWithUsername: validateUserWithUsername
}