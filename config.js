const cloudinary = require('cloudinary');

const config = () => {
	cloudinary.config({ 
		cloud_name: "dv7e36bfu", 
		api_key: "313464432566752", 
		api_secret: "A4n4q7z9wkDjhNNEVkAfJE6nDmY"
	})
}

module.exports = {
	config : config
}