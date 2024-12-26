module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		switch (req.method) {
			case 'GET':
				if (req.params.param1) {
					getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
				}
				break
			case 'PUT':
				put(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break
			case 'POST':
				post(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break
			case 'DELETE':
				deleteItem(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break
			default:
				restError.method(req, reject)
				break
		}
	} catch (err) {
		reject(err)
	}
})

function getOne(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!req.params.param1) return reject(`param1 required`)
			dbModel.posts.findOne({ _id: req.params.param1 })
				.then(resolve)
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}

function getList(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let options = {
				page: req.query.page || 1,
				limit: req.query.pageSize || 50,
			}
			let filter = {
				author: sessionDoc.user
			}
			dbModel.posts.paginate(filter, options)
				.then(resolve)
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}

function post(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = req.body || {}

			delete data._id
			delete data.comments
			delete data.likes
			delete data.hashTags
			delete data.mentions
			delete data.author

			data.author = sessionDoc.user
			const newDoc = new dbModel.posts(data)

			newDoc.save()
				.then(resolve)
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}

function put(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!req.params.param1) return reject(`param1 required`)
			let data = req.body || {}
			delete data._id
			delete data.comments
			delete data.likes
			delete data.hashTags
			delete data.mentions
			delete data.author


			let doc = await dbModel.posts.findOne({ _id: req.params.param1, author: sessionDoc.user })
			if (!doc) return reject(`post not found`)

			Object.assign(doc, data)
			doc.save()
				.then(resolve)
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}

function deleteItem(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!req.params.param1) return reject(`param1 required`)
			dbModel.posts
				.deleteOne({ _id: req.params.param1, author: sessionDoc.user })
				.then(resolve)
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}