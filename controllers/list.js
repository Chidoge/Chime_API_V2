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
// const handleGetList = (req, res, db, bcrypt) => {
    
//     let { username } = req.query;
    
//     /* Return all users */
//     getUsers(db, username)
//     .then(onlineUsers => {
//         return res.json({ code: 0, users : onlineUsers});
//     });

// }

// const getUsers = async(db, username) => {

// 	/* Initial array of online users */
// 	let onlineUsers = [];

// 	/* Get all the users that isn't the user requesting the list */
// 	const users = await db.select('*').from('login').where('username','!=',username);

// 	for (var i = 0; i < users.length; i++) {

// 		const user = await db.select('picture', 'first', 'last')
// 								.from('profile')
// 								.where('username','=', users[i].username);
		
// 		userInfo = {
// 			username: users[i].username,
// 			lastSeen : users[i].lastseen,
// 			first : user[0].first,
// 			last : user[0].last,
// 			picture : user[0].picture
// 		}
// 		onlineUsers.push(userInfo);
// 	} 
// 	return onlineUsers;
// }


// module.exports = {
// 	handleGetList : handleGetList
// }