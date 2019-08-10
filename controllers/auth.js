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
const handleRegister = (req, res, bcrypt , pool) => {

    const { username, first, last, password } = req.body;

    if (!username || !first || !last || !password) {
        return res.status(401).json({ code : 3 });
    }

    pool.request()
    .query(`select username from auth where username = '${username}'`)
    .then(result => {
        if (result.recordset.length !== 0) {
            return res.status(402).json({ code: 2 });
        }
        else {

            /* Synchronous hashing */
            const hash = bcrypt.hashSync(password);
            const lastSeen = ((new Date).getTime()).toString();
            pool.request()
            .query(`insert into auth (hash, username, lastseen) values ('${hash}', '${username}', '${lastSeen}');`)
            .then(result => {
                pool.request()
                .query(`insert into profile (username, first, last, picture) values ('${username}', '${first}', '${last}', '${'https://i.imgur.com/FSgbIi4.png'}');`)
                .then(result => {
                    return res.status(200).json({ code : 0, 
                        user: {
                            username: username,
                            first : first, 
                            last : last, 
                            picture : 'https://i.imgur.com/FSgbIi4.png'
                        }}) 
                })
                
            })
        }
    });
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
const handleSignIn = (req, res, bcrypt, pool) => {
	
	/* Destructure request body */
	const { username, password } = req.body;
	if (!(username && password)) {
		return res.status(401).json({ code : 3 });
    }

	validateUserWithUsername(pool, bcrypt, username, password)
	.then(isValid => {
		if (isValid) {
			updateLastSeen(pool, username)
			.then(() => {
				getProfile(pool, username)
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
			return res.status(403).json({ code : 1 });
		}
	})
}

const getProfile = (pool, username) => {

    return new Promise((resolve, reject) => {

        pool.request()
        .query(`select * from profile where username = '${username}'`)
        .then(result => {
            const profile = result.recordset[0];
            resolve(profile);
        })
        
    })
}

const updateLastSeen = (pool, username) => {

    return new Promise((resolve, reject) => {

        const timeNow = (new Date).getTime();
        pool.request()
        .query(`update auth set lastseen = '${timeNow}' where username = '${username}'`)
        .then(result => {
            resolve(true);
        })
        
    })
}


const validateUserWithUsername = (pool, bcrypt, username, password) => {
    return new Promise((resolve, reject) => {
        pool.request()
        .query(`select hash from auth where username = '${username}'`)
        .then(result => {
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



}


module.exports = {
    handleRegister : handleRegister,
    handleSignIn : handleSignIn,
    validateUserWithUsername: validateUserWithUsername
}