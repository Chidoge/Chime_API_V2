const auth = require('./auth')

const handleDeleteUser = (req, res, bcrypt, db) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ code: 3 })
    }

    auth.validateUserWithUsername(db, bcrypt, username, password)
    .then(isValid => {
        if (isValid) {
            db('auth')
            .where('username', '=', username)
            .del()
            .then(() => {
                db('profile')
                .where('username', '=', username)
                .del()
                .then(() => res.status(200).json({ code: 0 }))
                .catch(err => res.status(500).json({ code: 4 }))
            })
        }
        /* Invalid password */
        else {
            return res.status(403).json({ code: 1 })
        }
    })
}

module.exports = {
    handleDeleteUser
}