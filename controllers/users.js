const auth = require('./auth');

const handleDeleteUser = (req, res, bcrypt, pool) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ code: 3 });
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
                .catch(err => {
                    return res.status(500).json({ code: 4 });
                })
            })
        }
        else {
            return res.status(403).json({ code: 1 });
        }
    })
}

module.exports = {
    handleDeleteUser
}