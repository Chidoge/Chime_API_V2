const auth = require('./auth')
const uploader = require('./messages')

const handleGetProfile = (req, res, db) => {
    /* Identify user from query string */
    const { username } = req.query
    
    if (!username) {
        return res.status(400).json({ code: 3 })
    }
	
    db.select('*').from('profile')
    .where('username', '=', username)
    .then(result => {
        if (result != "") {
            return res.status(200).json({ code: 0, user: result[0] })
        }
        else {
            return res.status(404).json({ code: 5 })
        }
    })
    .catch(err => res.status(500).json({ code: 4 }))
}


const handleSaveProfile = (req, res, bcrypt, db) => {
    /* Validate user */
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(500).json({ code: 3 })
    }

    auth.validateUserWithUsername(db, bcrypt, username, password)
    .then(isValid => {
        if (isValid) {
            return saveProfile(req, res, db)
        }
        else {
            return res.status(403).json({ code: 1 })
        }
    })
    .catch(err => res.status(500).json({ code: 4 }))
}

const saveProfile = (req, res, db) => {
    const { username, about, birthday, location, occupation, picture } = req.body

    if (picture) {
        uploader.getUrl(picture, 1)
        .then(url => {
            updateProfileUrl(db, username, about, birthday, location, occupation, url)
            .then(() => {
                db.select('*').from('profile')
                .where('username', '=', username)
                .then(result => res.status(200).json({ code: 0, user: result[0] }))
                .catch(() => res.status(500).json({ code: 4 }))
            })
            .catch(err => res.status(500).json({ code: 4 }))
        })
        .catch(err => res.status(500).json({ code: 4 }))
    }
    else {
        updateProfile(db, username, about, birthday, location, occupation)
        .then(() => {
            db.select('*').from('profile')
            .where('username', '=', username)
            .then(result => {
                return res.status(200).json({ code: 0, user: result[0] })
            })
            .catch(err => res.status(500).json({ code: 4 }))
        })
        .catch(err => res.status(500).json({ code: 4}))
    }
}

const updateProfileUrl = (db, username, about, birthday, location, occupation, picture) => {
    return new Promise((resolve, reject) => {
        db('profile').update({
            about,
            birthday,
            location,
            occupation,
            picture
        })
        .where('username', '=', username)
        .then(() => resolve(true))
        .catch(err => reject(err))
    })
}

const updateProfile = (db, username, about, birthday, location, occupation) => {
    return new Promise((resolve, reject) => {
        db('profile').update({
            about,
            birthday,
            location,
            occupation
        })
        .where('username', '=', username)
        .then(() => resolve(true))
        .catch(err => reject(err))
    })
}

module.exports = {
    handleGetProfile,
    handleSaveProfile
}