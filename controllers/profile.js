const auth = require('./auth');
const uploader = require('./messages');

const handleGetProfile = (req, res, pool) => {

    /* Identify user from query string */
	const { username } = req.query;
	
    pool.request()
    .query(`select * from profile where username = '${username}'`)
    .then(result => {
        if (result.recordset.length !== 0) {
            const user = result.recordset[0];
            return res.status(200).json({ code: 0, user: user });
        }
        else {
            return res.status(404).json({ code: 5 });
        }
    })
}


const handleSaveProfile = (req, res, bcrypt, pool) => {

    /* Validate user */
    const { username, password } = req.body;

    auth.validateUserWithUsername(pool, bcrypt, username, password)
    .then(isValid => {
        if (isValid) {
            saveProfile(req, res, pool);
        }
        else {
            return res.status(403).json({ code: 1 });
        }
    })
    .catch(err => {
        return res.status(500).json({ code: 4 });
    })
}

const saveProfile = (req, res, pool) => {

    const { username, about, birthday, location, occupation, picture } = req.body;
    if (picture) {
        uploader.getUrl(picture)
        .then(url => {
            updateProfileUrl(pool, username, about, birthday, location, occupation, url)
            .then(complete => {
                if (complete) {
                    return res.status(200).json({ code: 0});
                }
                else {
                    return res.status(500).json({ code: 4});
                }
            })
        })
    }
    else {
        updateProfile(pool, username, about, birthday, location, occupation)
        .then(complete => {
            if (complete) {
                return res.status(200).json({ code: 0});
            }
            else {
                return res.status(500).json({ code: 4});
            }
        })
    }
}

const updateProfileUrl = (pool, username, about, birthday, location, occupation, picture) => {

    return new Promise((resolve, reject) => {
        pool.request()
        .query(`update profile 
                set about = '${about}',
                birthday = '${birthday}',
                location = '${location}',
                occupation = '${occupation}',
                picture = '${picture}'
                where username = '${username}'
        `)
        .then(() => {
            resolve(true);
        })
        .catch(err => {
            resolve(false);
        })
    })
}

const updateProfile = (pool, username, about, birthday, location, occupation) => {
    return new Promise((resolve, reject) => {
        pool.request()
        .query(`update profile 
                set about = '${about}',
                birthday = '${birthday}',
                location = '${location}',
                occupation = '${occupation}'
                where username = '${username}'
        `)
        .then(() => {
            resolve(true);
        })
        .catch(err => {
            resolve(false);
        })
    })
}



module.exports = {
    handleGetProfile,
    handleSaveProfile
}