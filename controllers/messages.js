const cloudinary = require('cloudinary');
const cloudConfig = require('../config');

const auth = require('./auth');

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
const handleSendMessage = (req, res, bcrypt, pool) => {

	/* Get body of request */
	const { sender, destination, password, message } = req.body;
    let { isImage } = req.body;
    isImage = +isImage;

	if (!sender || !password || !destination || !message) {
		return res.status(200).json({ code : 3 });
	}
    
    auth.validateUserWithUsername(pool, bcrypt, sender, password)
    .then(isValid => {
        if (isValid) {
            insertData(pool, sender, destination, message, isImage)
            .then((result) => {
                if (result === 'Success') {
                    return res.status(200).json({ code : 0 });
                }
                else {
                    return res.status(404).json({ code : 4 });
                }
            })
        }
        else {
            return res.status(403).json({ code : 1 });
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
const handleFetchMessages = (req, res, bcrypt, pool) => {

	/* Get body of request */
	const { sender, destination, password } = req.body;

	if (!sender || !password || !destination) {

		return res.status(401).json({ code : 3 });
	}

    auth.validateUserWithUsername(pool, bcrypt, sender, password)
    .then(isValid => {
        if (isValid) {
            pool.request()
            .query(`
                select * from messages
                where sender = '${sender}' and destination = '${destination}'
                or sender = '${destination}' and destination = '${sender}'
                order by timestamp
            `)
            .then(result => {
                const messages = result.recordset;
                return res.status(200).json({ code : 0 , messages : messages });
            })
        
        }
        /* If password is wrong */
        else {
            return res.status(403).json({ code : 1 });
        }
    })
}


const insertData = (pool, sender, destination, message, isImage) => {

    return new Promise((resolve, reject) => {
        const timeStamp = (new Date).getTime();
        if (isImage) {
            getUrl(message)
            .then(url => {
                pool.request()
                .query(`insert into messages (sender, destination, message, timestamp, isimage) values('${sender}', '${destination}', '${url}', '${timeStamp}', '${isImage}')`)
                .then(result => {
                    resolve('Success');
                })
                /* Return error if failed */
                .catch(err => {
                    resolve('No such user');
                });
            });
        } else {
            pool.request()
            .query(`insert into messages (sender, destination, message, timestamp, isimage) values('${sender}', '${destination}', '${message}', '${timeStamp}', '${isImage}')`)
            .then(result => {
                resolve('Success');
            })
            /* Return error if failed */
            .catch(err => {
                resolve('No such user');
            });
        }
    })

}


/* Method uses cloudinary API to store images */
const getUrl = (b64String) => {

    return new Promise((resolve, reject) => {
        cloudConfig.config();
        cloudinary.v2.uploader.upload(b64String, { resource_type: 'image', quality: 'auto:low' })
        .then(result => {
            resolve(result.secure_url);
        });
    })

}

module.exports = {
	handleSendMessage : handleSendMessage,
	handleFetchMessages : handleFetchMessages
}