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

			case 'POST':
				if (req.params.param1 == 'like' && req.params.param2) {
					like(dbModel, sessionDoc, req).then(resolve).catch(reject)
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

function like(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!req.params.param2) return reject(`param1 required`)
			let doc = await dbModel.posts.findOne({ _id: req.params.param2 })
			if (!doc) return reject(`post not found`)
			const index = doc.likes.findIndex(usr => usr.toString() === sessionDoc.user.toString())
			if (index > -1) {
				doc.likes.splice(index, 1)
			} else {
				doc.likes.push(sessionDoc.user)
			}
			doc.save()
				.then(doc => {
					let obj = doc.toJSON()
					obj.liked = obj.likes.findIndex(usr => usr.toString() === sessionDoc.user.toString()) > -1 ? true : false
					resolve(obj)
				})
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}

function getOne(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!req.params.param1) return reject(`param1 required`)
			dbModel.posts.findOne({ _id: req.params.param1 })
				.then(doc => {
					if (doc) {
						let obj = doc.toJSON()
						obj.liked = obj.likes.findIndex(usr => usr.toString() === sessionDoc.user.toString()) > -1 ? true : false
						resolve(obj)
					} else {
						reject(`post not found`)
					}
				})
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
				sort: { _id: -1 },
				populate: [{
					path: 'author',
					select: '_id name username role profilePicture location'
				}]
			}
			let filter = {

			}
			dbModel.posts.paginate(filter, options)
				.then(result => {
					result.docs = result.docs.map(e => {
						e.liked = e.likes.findIndex(usr => usr.toString() === sessionDoc.user.toString()) > -1 ? true : false
						return e
					})
					resolve(result)
				})
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}
