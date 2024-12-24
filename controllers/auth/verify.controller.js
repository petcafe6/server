// const userDbHelper = require('../../db/helpers/userdb-helper')

module.exports = (req) => new Promise(async (resolve, reject) => {
	try {
		if (!req.method == 'POST') return restError.method(req, reject)
		let username = req.getValue('username')
		let email = req.getValue('email')
		let phoneNumber = req.getValue('phoneNumber') || ''
		let authCode = req.getValue('authCode')

		if (!authCode) return reject(`autCode required`)
		let filter = { passive: false, authCode: authCode }
		let filter2 = {}

		if (email) {
			filter.email = email
			filter2.email = email
		} else if (phoneNumber) {
			filter.phoneNumber = phoneNumber
			filter2.phoneNumber = phoneNumber
		} else if (username) {
			filter.username = username
			filter2.username = username
		} else {
			return reject(`One of email, phone, username required.`)
		}
		const docs = await db.authCodes.find(filter).sort({ _id: -1 }).limit(1)
		if (docs.length == 0) return reject('verification failed. authCodeDoc not found')
		let authCodeDoc = docs[0]
		if (authCodeDoc.authCodeExpire.getTime() < new Date().getTime()) return reject('authCode expired')
		if (authCodeDoc.verified) return reject('authCode has already been verified')


		let userDoc = await db.users.findOne(filter2)

		if (userDoc == null) {
			const userId = new ObjectId()
			userDoc = new db.users({
				_id: userId,
				username: authCodeDoc.username || userId.toString(),
				email: authCodeDoc.email,
				phoneNumber: authCodeDoc.phoneNumber,
				password: authCodeDoc.password,
				name: authCodeDoc.name,
				dateOfBirth: authCodeDoc.dateOfBirth,
				gender: authCodeDoc.gender,
				role: 'pet_owner',
			})
		}
		console.log('userDoc:', userDoc)
		userDoc = await userDoc.save()
		let obj = userDoc.toJSON()
		delete obj.password
		console.log('obj:', obj)
		authCodeDoc.verified = true
		authCodeDoc.verifiedDate = new Date()
		authCodeDoc = await authCodeDoc.save()

		resolve(obj)

	} catch (err) {
		console.log('err:', err)
		reject(err)
	}
})
