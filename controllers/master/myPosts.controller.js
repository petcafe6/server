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
				.then(async doc => {
					if (doc) {
						let obj = doc.toJSON()
						if (await dbModel.posts_likes.countDocuments({ post: doc._id, likedBy: sessionDoc.user }) > 0) {
							obj.liked = true
						} else {
							obj.liked = false
						}
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
				author: sessionDoc.user
			}
			dbModel.posts.paginate(filter, options)
				.then(async result => {
					let i = 0
					while (i < result.docs.length) {
						if (await dbModel.posts_likes.countDocuments({ post: result.docs[i]._id, likedBy: sessionDoc.user }) > 0) {
							result.docs[i].liked = true
						} else {
							result.docs[i].liked = false
						}
						i++
					}

					resolve(result)
				})
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
			delete data.commentCount
			delete data.likeCount
			delete data.hashtags
			delete data.mentions
			delete data.author

			data.author = sessionDoc.user
			const newDoc = new dbModel.posts(data)

			newDoc.save()
				.then(doc => {
					let obj = doc.toJSON()
					obj.liked = false
					resolve(obj)
				})
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
			delete data.commentCount
			delete data.likeCount
			delete data.hashtags
			delete data.mentions
			delete data.author


			let doc = await dbModel.posts.findOne({ _id: req.params.param1, author: sessionDoc.user })
			if (!doc) return reject(`post not found`)

			Object.assign(doc, data)
			doc.save()
				.then(async doc => {
					let obj = doc.toJSON()
					if (await dbModel.posts_likes.countDocuments({ post: doc._id, likedBy: sessionDoc.user }) > 0) {
						obj.liked = true
					} else {
						obj.liked = false
					}
					resolve(obj)
				})
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
			const doc = await dbModel.posts.findOne({ _id: req.params.param1, author: sessionDoc.user })
			if (!doc) return reject(`post not found`)

			await dbModel.posts_likes.deleteOne({ post: doc._id })
			await dbModel.posts_comments.deleteOne({ post: doc._id })

			dbModel.posts
				.deleteOne({ _id: doc._id })
				.then(resolve)
				.catch(reject)
		} catch (err) {
			reject(err)
		}
	})
}