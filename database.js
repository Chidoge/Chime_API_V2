const setUpDB = async(db) => {

	return new Promise((resolve, reject) => {
    setUpAuth(db)
      .then(() => {
        setUpProfile(db)
          .then(() => {
            setUpMessages(db)
              .then(() => {
                resolve(true)
              })
          })
      })
  })
}

const setUpAuth = (db) => {

	return new Promise((resolve, reject) => {
		db.schema.hasTable('auth')
		.then(
			(userTableExists) => {
				if (!userTableExists) {
					db.schema.createTable('auth', function (table) {
						table.string('username')
						table.string('hash')
						table.string('lastSeen')
					})
					.then(
						() => {
							console.log('Auth table created!')
							resolve(true)
						}
					)
				}
				else {
					console.log('Auth table : OKAY')
					resolve(true)
				}
			}
		)
	})
}


const setUpProfile = (db) => {

	return new Promise((resolve, reject) => {
		db.schema.hasTable('profile')
		.then(
			(userTableExists) => {
				if (!userTableExists) {
					db.schema.createTable('profile', function (table) {
						table.string('username')
            table.string('first')
            table.string('last')
            table.string('occupation')
            table.string('picture')
            table.string('about')
            table.string('birthday')
            table.string('location')
					})
					.then(
						() => {
							console.log('Profile table created!')
							resolve(true)
						}
					)
				}
				else {
					console.log('Profile table : OKAY')
					resolve(true)
				}
			}
		)
	})
}


const setUpMessages = (db) => {

	return new Promise((resolve, reject) => {
		db.schema.hasTable('messages')
		.then(
			(userTableExists) => {
				if (!userTableExists) {
					db.schema.createTable('messages', function (table) {
            table.string('sender')
            table.string('destination')
            table.string('message')
            table.bigInteger('timestamp')
            table.integer('isImage')
					})
					.then(
						() => {
							console.log('Message table created!')
							resolve(true)
						}
					)
				}
				else {
					console.log('Message table : OKAY')
					resolve(true)
				}
			}
		)
	})
}

module.exports = {
    setUpDB : setUpDB
}