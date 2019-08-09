const cloudinary = require('cloudinary');
const cloudConfig = require('../config');

const auth = require('./auth');

/**
 * This API handler takes 5 parameters
 * 1 - sender: number - id of source
 * 2 - destination: number
 * 3 - password: string - password of sender
 * 4 - message: string - content of message - could be simple message or base64 string representing image
 * 5 - isImage: boolean - indicates whether message is image 
 * 
 * Returns - 
 * 1 - code: number - indicates whether API was successful
 */
const handleSendMessage = (req, res, db, bcrypt) => {

	/* Get body of request */
	const { password, message, isImage } = req.body;
    let { sender, destination } = req.body;
    sender = +sender;
	destination = +destination;

	if (!sender || !password || !destination || !message) {
		return res.status(200).json({ code : 3 });
	}

    auth.validateUserWithID(db, bcrypt, sender, password)
    .then(isValid => {
        if (isValid) {
            insertData(db, req, res, message, isImage)
            .then(() => {
                return res.status(200).json({ code : 0 });
            })	
        }
        else {
            return res.status(200).json({ code : 1 });
        }
    })
}

/**
 * This API handler takes 3 parameters
 * 1 - sender: number - id number of user requesting messages
 * 2 - destination: number - target of messages
 * 3 - password: string - password of user requesting messages
 * 
 * Returns 
 * 1 - code: number - indicates whether API call was successful
 * 2 - messages: [] - {
 *      message: string,
 *      sender: number,
 *      destination: number,
 *      timestamp: number,
 *      isImage: number,
 *      messageID: number
 * }
 */
const handleGetMessages = (req, res, db, bcrypt) => {

	/* Get body of request */
	const { password } = req.body;

    let { sender, destination } = req.body;
    sender = +sender;
	destination = +destination;

	if (!sender || !password || !destination) {
		return res.status(200).json({ code : 3 });
	}

    auth.validateUserWithID(db, bcrypt, sender, password)
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
                return res.status(200).json({ code : 0 , messages : messages });
            })
        
        }
        /* If password is wrong */
        else {
            return res.status(200).json({ code : 1 });
        }
    })
}


const insertData = async (db, sender, destination, res, message, isImage) => {

	let messageInput;
	
	if (isImage) {
		messageInput = await getUrl(mes, fileCode);
	} else {
		messageInput = message;
	}

	/* Transaction for consistency */
    await db.transaction(trx => {
        const timeStamp = (new Date).getTime();
        /* First insert into message table */
        db.insert({
            sender : sender,
            destination : destination,
            message : messageInput,
            timestamp : timeStamp,
            isImage: (isImage === true) ? 1 : 0 
        })
        .into('messages')
        .returning('*')
        /* Commit changes */
        .then(trx.commit)
        /* Delete transaction if failed anywhere */
        .catch(trx.rollback)
    })
    /* Return error if failed */
    .catch(err => {
        return res.json({code : 4 });
    });
}


/* Method uses cloudinary API to store images */
const getUrl = async(b64String) => {
    cloudConfig.config();
	const result = await cloudinary.v2.uploader.upload(b64String, { resource_type: 'image', quality: 'auto:low' });
	return result.secure_url;
}

module.exports = {
	handleSendMessage : handleSendMessage,
	handleGetMessages : handleGetMessages
}