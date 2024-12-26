module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		if (!sessionDoc) {
			return restError.session(req, reject)
		}

		switch (req.method) {
			case 'GET':
				getMyProfile(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break
			case 'PUT':
			case 'POST':
				if (req.params.param1 == 'changePassword') {
					changePassword(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					updateMyProfile(dbModel, sessionDoc, req).then(resolve).catch(reject)
				}

				break
			default:
				restError.method(req, reject)
				break
		}
	} catch (err) {
		reject(err)
	}
})

function changePassword(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		let oldPassword = req.getValue('oldPassword')
		let newPassword = req.getValue('newPassword')



		if (!newPassword) return reject('new password required')
		if (newPassword.length < 8) return reject('password must be at least 8 characters')
		let userDoc = await dbModel.users.findOne({ _id: sessionDoc.user })
		if (userDoc.password) {
			if (!oldPassword) return reject('old password required')
			if ((userDoc.password || '') != oldPassword) {
				return reject(`incorrect old password`)
			}
		}

		userDoc.password = newPassword
		userDoc
			.save()
			.then(() => resolve(`your password has been changed successfuly`))
			.catch(reject)
	})
}

function getMyProfile(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let doc = await dbModel.users.findOne({ _id: sessionDoc.user })
			// .select('-password')
			if (doc) {
				let obj = doc.toJSON()
				if ((obj.profilePicture || '').length == 24) {
					obj.profilePicture = `${process.env.PUBLIC_URL}/api/v1/s3/image/show/${obj.profilePicture}/${req.query.w || 400}`
				}
				obj.followerCount = (obj.followers || []).length
				obj.followingCount = (obj.following || []).length
				obj.postCount = await dbModel.posts.countDocuments({ user: doc._id })

				delete obj.followers
				delete obj.following

				// obj.session = {
				// 	sessionId: sessionDoc._id,

				// }

				resolve(obj)
			} else
				reject('user not found')
		} catch (err) {
			reject(err)
		}
	})

}
function updateMyProfile(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		let doc = await dbModel.users.findOne({ _id: sessionDoc.user })
		if (!doc)
			return reject('oturuma ait kullanıcı bulunamadı')
		let data = req.body || {}
		delete data._id
		console.log(data)
		let newDoc = Object.assign(doc, data)
		if (!epValidateSync(newDoc, reject)) return

		newDoc.save()
			.then(newDoc => {
				let obj = newDoc.toJSON()
				delete obj.password
				resolve(obj)
			})
			.catch(reject)
	})
}