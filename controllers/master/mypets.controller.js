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
			dbModel.pets.findOne({ _id: req.params.param1, deleted: false })
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
				sort: { _id: -1 }
			}
			let filter = {
				owner: sessionDoc.user,
				deleted: false
			}
			dbModel.pets.paginate(filter, options)
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
			if (!data.name) return reject(`name required`)

			if (await dbModel.pets.countDocuments({ owner: sessionDoc.user, name: data.name, deleted: false }) > 0)
				return reject(`name already exists`)
			data.owner = sessionDoc.user
			const newDoc = new dbModel.pets(data)

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
			delete data.owner
			if (!data.name) return reject(`name required`)
			if (await dbModel.pets.countDocuments({ owner: sessionDoc.user, name: data.name, deleted: false, _id: { $ne: req.params.param1 } }) > 0)
				return reject(`name already exists`)
			let doc = await dbModel.pets.findOne({ _id: req.params.param1, owner: sessionDoc.user })
			if (!doc) return reject(`pet not found`)

			Object.assign(doc, data)
			console.log(data)
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
			dbModel.pets.updateOne({
				_id: req.params.param1, deleted: false, owner: sessionDoc.user
			}, { $set: { deleted: true, deletedAt: new Date() } })
				.then(resolve)
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}