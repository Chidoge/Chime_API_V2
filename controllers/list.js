const auth = require('./auth')

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
const handleGetList = (req, res, db) => {
    let { username } = req.query

    if (!username) {
        return res.status(400).json({ code : 3 })
    }
    
    /* Return all users */
    getUsers(db, username)
    .then(onlineUsers => res.status(200).json({ code: 0, users : onlineUsers}))
    .catch(err => res.status(500).json({ code : 4 }))
}

const getUsers = async (db, username) => {
    return new Promise((resolve, reject) => {
        /* Initial array of online users */
        let onlineUsers = []

        /* Get all the users that isn't the user requesting the list */
        auth.updateLastSeen(db, username)
        .then(() => {
            db('profile')
            .join('auth', 'profile.username', '=', 'auth.username')
            .select('profile.username', 'profile.first', 'profile.last', 'profile.picture','auth.lastSeen')
            .where('profile.username', '!=', username)
            .then(users => {
                for (let i = 0; i < users.length; i++) {
                    const { username, first, last, lastSeen, picture } = users[i]
                    const userInfo = { username, first, last, lastSeen, picture } 
                    onlineUsers.push(userInfo)
                } 
                resolve(onlineUsers)
            })
        })
    })
}

module.exports = {
	handleGetList : handleGetList
}