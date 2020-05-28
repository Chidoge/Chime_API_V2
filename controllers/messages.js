const cloudinary = require('cloudinary')
const cloudConfig = require('../config')

const auth = require('./auth')

/**
 * This API handler takes 5 parameters
 * 1 - sender: string - username of source
 * 2 - destination: string
 * 3 - password: string - password of sender
 * 4 - message: string - content of message - could be simple message or base64 string representing image
 * 5 - isImage: boolean - indicates whether message is image 
 * 
 * Returns - 
 * 1 - code: number - indicates whether API was successful
 */
const handleSendMessage = (req, res, bcrypt, db) => {

	/* Get body of request */
	const { sender, destination, password, message } = req.body
    let { isImage } = req.body
    isImage = +isImage

	if (!sender || !password || !destination || !message) {
		return res.status(400).json({ code : 3 })
	}
    
    auth.validateUserWithUsername(db, bcrypt, sender, password)
    .then(isValid => {
        if (isValid) {
            insertData(db, sender, destination, message, isImage)
            .then(() => res.status(200).json({ code : 0 }))
            .catch(err => res.status(500).json({ code: 4 }))
        }
        /* Password mismatch */
        else {
            return res.status(403).json({ code : 1 })
        }
    })
}

/**
 * This API handler takes 3 parameters
 * 1 - sender: string - username of user requesting messages
 * 2 - destination: string - username of target of messages
 * 3 - password: string - password of user requesting messages
 * 
 * Returns 
 * 1 - code: number - indicates whether API call was successful
 * 2 - messages: [] - {
 *      message: string,
 *      sender: string,
 *      destination: string,
 *      timestamp: number,
 *      isImage: number
 * }
 */
const handleFetchMessages = (req, res, bcrypt, db) => {
	/* Get body of request */
    const { sender, destination, password } = req.body

	if (!sender || !password || !destination) {
		return res.status(400).json({ code : 3 })
	}

    auth.validateUserWithUsername(db, bcrypt, sender, password)
    .then(isValid => {
        if (isValid) {
            db.select('*')
                .from('messages')
                .where(function() {
                    this.where('sender', sender).andWhere('destination', destination)
                }).orWhere(function() {
                    this.where('sender', destination).andWhere('destination', sender)
                })
                .orderBy('timestamp')
                .then(messages => {
                    return res.status(200).json({ code : 0 , messages })
                })
                .catch(err => res.status(500).json({ code: 4 }))
        }
        /* Invalid password */
        else {
            return res.status(403).json({ code : 1 })
        }
    })
}

const insertData = (db, sender, destination, message, isImage) => {
    return new Promise((resolve, reject) => {
        const timestamp = (new Date).getTime()

        getUrl(message, isImage)
        .then(proccessedMessage => {
            db.insert({
                sender,
                destination,
                message: proccessedMessage,
                isImage,
                timestamp
            })
            .into('messages')
            .then(() => resolve())
            /* Return error if failed to save to DB*/
            .catch(err => reject(err))
        })
        /* If failed to upload */
        .catch(err => reject(err))
    })

}

/* Method uses cloudinary API to store images */
const getUrl = (b64String, isImage) => {
    return new Promise((resolve, reject) => {
        /* Skip if ordinary image */
        if (isImage === 0) {
            resolve(b64String)
        }

        cloudConfig.config()
        cloudinary.v2.uploader.upload(b64String, { resource_type: 'image', quality: 'auto:low' })
        .then(result => resolve(result.secure_url))
        .catch(err => console.log(err))
    })
}

module.exports = {
	handleSendMessage : handleSendMessage,
    handleFetchMessages : handleFetchMessages,
    getUrl: getUrl
}