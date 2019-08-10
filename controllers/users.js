const auth = require('./auth');

const handleDeleteUser = (req, res, bcrypt, pool) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(401).json({ code: 3 });
    }

    auth.validateUserWithUsername(pool, bcrypt, username, password)
    .then(isValid => {
        if (isValid) {
            pool.request()
            .query(`delete from auth where username = '${username}'`)
            .then(() => {
                pool.request()
                .query(`delete from profile where username = '${username}'`)
                .then(() => {
                    return res.status(200).json({ code: 0 });
                })
            })
        }
        else {
            return res.status(404).json({ code: 1 });
        }
    })
}

module.exports = {
    handleDeleteUser
}