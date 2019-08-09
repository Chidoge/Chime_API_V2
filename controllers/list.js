/**
 * This API handler takes 1 parameter
 * 1 - id: number - id of user requesting the list
 * Returns
 * - list: [] - {
 *      id: number
 *      lastSeen: number,
 *      first: string,
 *      last: string,
 *      picture: string
 * }
 */
const handleGetList = (req, res, db, bcrypt) => {
    
    let { id } = req.query;
    id = +id;
    
    /* Return all users */
    getUsers(db, id)
    .then(onlineUsers => {
        return res.json({ code: 0, users : onlineUsers});
    });

}

const getUsers = async(db, id) => {

	/* Initial array of online users */
	let onlineUsers = [];

	/* Get all the users that isn't the user requesting the list */
	const users = await db.select('*').from('login').where('id','!=',id);

	for (var i = 0; i < users.length; i++) {

		const user = await db.select('picture', 'first', 'last')
								.from('profile')
								.where('id','=', users[i].id);
		
		userInfo = {
            id : users[i].id,
			lastSeen : users[i].lastseen,
			first : user[0].first,
			last : user[0].last,
			picture : user[0].picture
		}
		onlineUsers.push(userInfo);
	} 
	await updateLastSeen(db, id);
	return onlineUsers;

}

const updateLastSeen = async(db, id) => {

	const timeNow = (new Date).getTime().toString();
	await db('login').update({ lastseen : timeNow }).where('id','=',id);

}


module.exports = {
	handleGetList : handleGetList
}