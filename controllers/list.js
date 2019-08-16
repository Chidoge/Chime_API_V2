// /**
//  * This API handler takes 1 parameter
//  * 1 - id: number - id of user requesting the list
//  * Returns
//  * - list: [] - {
//  *      username: string,
//  *      lastSeen: number,
//  *      first: string,
//  *      last: string,
//  *      picture: string
//  * }
//  */
const handleGetList = (req, res, pool) => {
    
    let { username } = req.query;

    if (!username) {
        return res.status(400).json({ code : 3 });
    }
    
    /* Return all users */
    getUsers(pool, username)
    .then(onlineUsers => {
        return res.status(200).json({ code: 0, users : onlineUsers});
    })
    .catch(err => {
        return res.status(500).json({ code : 4 });
    });

}

const getUsers = (pool, username) => {

    return new Promise((resolve, reject) => {
        /* Initial array of online users */
        let onlineUsers = [];

        /* Get all the users that isn't the user requesting the list */
        updateLastSeen(pool, username)
        .then(complete => {
            pool.request()
            .query(`select * from auth where not username = '${username}'`)
            .then(result => {
                const users = result.recordset;
                
                for (var i = 0; i < users.length; i++) {
                    getProfile(pool, users[i])
                    .then(user => {
                        onlineUsers.push(user);
                    })
                } 
                /* Set time out to let promises resolve */
                setTimeout(() => {
                    resolve(onlineUsers);
                }, 750)
            })
            .catch(err => {
                reject(err);
            })
        })
    })
}


const getProfile = (pool, user) => {
	
    return new Promise((resolve, reject) => {

        pool.request()
        .query(`select picture, first, last from profile where username = '${user.username}'`)
        .then(result => {
			const row = result.recordset[0];
			const userObject = {
				first: row.first,
				last: row.last,
				picture: row.picture,
				lastSeen: +user.lastSeen,
				username: user.username
			}
            resolve(userObject);
        })
        .catch(err => {
            console.log(err);
        })  
    })
}
 

module.exports = {
	handleGetList : handleGetList
}