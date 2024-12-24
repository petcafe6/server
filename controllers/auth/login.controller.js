const { saveSession } = require('./helper')
module.exports = (req) => new Promise(async (resolve, reject) => {
	if (req.method != 'POST') return restError.method(req, reject)

	let username = null
	let email = null
	let phoneNumber = null
	let identifier = null

	identifier = req.getValue('identifier')
	if (!identifier) {
		username = req.getValue('username')
		email = req.getValue('email')
		phoneNumber = req.getValue('phoneNumber')
	} else {
		if (identifier.includes('@')) {
			email = identifier
		} else if (!isNaN(identifier)) {
			phoneNumber = identifier
		} else {
			username = identifier
		}
	}
	let password = req.getValue('password')
	let deviceId = req.getValue('deviceId')
	let role = req.getValue('role') || 'user'
	let lang = req.getValue('language') || req.getValue('lang')
	if (!password) return reject('password required')
	let filter = { password: password }
	if (email) {
		filter.email = email
	} else if (phoneNumber) {
		filter.phoneNumber = phoneNumber
	} else if (username) {
		filter.username = username
	} else {
		return reject(`One of email, phoneNumber, username required.`)
	}

	const userDoc = await db.users.findOne(filter)
	if (!userDoc) return reject(`login failed. user not found.`)
	if (userDoc.passive) return reject(`account is passive. please contact with administrators`)
	const userRoleList = userDoc.role.split(',').map((role) => role.trim())

	if (role != 'user' && !userRoleList.includes(role)) return reject(`incorrect role`)

	saveSession(userDoc, role, req, 'aliabi', null).then(resolve).catch(reject)

})
