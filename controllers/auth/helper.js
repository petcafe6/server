const auth = require('../../lib/auth')
const { ObjectId } = require('mongodb')
exports.saveSession = async function (userDoc, role, req, loginProvider = 'aliabi', oauth2 = null) {
	let deviceId = req.getValue('deviceId') || ''
	try {

		await db.sessions.updateMany(
			{ user: userDoc._id, deviceId: deviceId, closed: false },
			{ $set: { closed: true } },
			{ multi: true }
		)

	} catch (err) {
		console.error('saveSession err:', err)
	}

	return new Promise(async (resolve, reject) => {
		try {

			let sessionDoc = new db.sessions({
				user: userDoc._id,
				loginProvider: loginProvider,
				deviceId: deviceId,
				lastIP: req.IP || '',
				closed: false,
				oauth2: oauth2,
				requestHeaders: req.headers
			})


			sessionDoc
				.save()
				.then(async (newDoc) => {
					let obj = {
						token: 'USER_' + auth.sign({ sessionId: newDoc._id.toString() }),
						user: userDoc.toJSON(),
					}
					delete obj.user.password
					resolve(obj)
				})
				.catch(reject)
		} catch (err) {
			reject(err)
		}

	})
}

exports.socialLogin = async function (req,
	loginProvider, email, name, imageUrl,
	oauth2Data, gender = '') {
	return new Promise(async (resolve, reject) => {
		try {
			let userDoc = await db.users.findOne({ email: email })
			if (!userDoc) {
				const userId = new ObjectId()
				userDoc = new db.users({
					_id: userId,
					username: userId.toString(),
					email: email,
					phoneNumber: null,
					role: 'pet_owner',
					name: `${name}`,
					gender: gender,
					dateOfBirth: '',
					profilePicture: imageUrl,
					bio: '',
				})
			} else {
				userDoc.name = `${name}`
				userDoc.profilePicture = imageUrl
				if (userDoc.gender != gender) userDoc.gender = gender
			}

			if (!epValidateSync(userDoc, reject)) return
			userDoc
				.save()
				.then(newDoc => {
					exports.saveSession(newDoc, 'user', req, loginProvider, oauth2Data)
						.then(resolve)
						.catch(reject)
				})
				.catch(err => {
					console.error('hata:', err)
					reject(err)
				})


		} catch (err) {
			reject(err)
		}
	})
}

exports.magicLinkLogin = async function (req, email) {
	return new Promise(async (resolve, reject) => {
		try {
			let userDoc = await db.users.findOne({ email: email })
			if (!userDoc) {
				const userId = new ObjectId()
				userDoc = new db.users({
					_id: userId,
					username: userId.toString(),
					email: email,
					phoneNumber: null,
					role: 'pet_owner',
					name: ``,
					gender: '',
					dateOfBirth: '',
					profilePicture: '',
					bio: '',
				})
			} else {
				if (userDoc.passive) return reject(`user is not active`)
			}

			if (!epValidateSync(userDoc, reject)) return

			userDoc
				.save()
				.then(newDoc => {
					exports.saveSession(newDoc, 'user', req, 'magiclink', null)
						.then(resolve)
						.catch(reject)
				})
				.catch(err => {
					console.error('hata:', err)
					reject(err)
				})


		} catch (err) {
			reject(err)
		}
	})
}