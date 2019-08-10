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
    
    /* Return all users */
    getUsers(pool, username)
    .then(onlineUsers => {
        return res.json({ code: 0, users : onlineUsers});
    });

}

const getUsers = (pool, username) => {


    return new Promise((resolve, reject) => {
        /* Initial array of online users */
        let onlineUsers = [];

        /* Get all the users that isn't the user requesting the list */
        pool.request()
        .query(`select * from login where not username = '${username}'`)
        .then(result => {
            const users = result.recordset;
            
            for (var i = 0; i < users.length; i++) {
                getProfile(pool, users[i].username)
                .then(user => {
                    userInfo = {
						username: users[i].username,
						lastSeen: +users[i].lastseen,
                        first : user.first,
                        last : user.last,
                        picture : user.picture
                    }
                    onlineUsers.push(userInfo);
                })
            } 
            /* Set time out to let promises resolve */
            setTimeout(() => {
                resolve(onlineUsers);
            }, 200)
        })
    
    })
}


const getProfile = (pool, username) => {

    return new Promise((resolve, reject) => {

        pool.request()
        .query(`select picture, first, last from profile where username = '${username}'`)
        .then(result => {
            resolve(result.recordset[0]);
        })
        
    })
}
 

module.exports = {
	handleGetList : handleGetList
}