module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		switch (req.method) {
			case 'GET':
				if (req.params.param2 == 'comments' && req.params.param1) {
					getComments(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else if (req.params.param2 == 'likedUsers' && req.params.param1) {
					getLikedUsers(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else if (req.params.param1) {
					getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
				}
				break

			case 'POST':
				if (req.params.param2 == 'like' && req.params.param1) {
					like(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else if (req.params.param2 == 'addNewComment' && req.params.param1) {
					addNewComment(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					return reject(`parameters incorrect`)
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

function getLikedUsers(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let options = {
				page: req.query.page || 1,
				limit: req.query.pageSize || 50,
				sort: { _id: -1 },
				populate: [{
					path: 'likedBy',
					select: '_id name username role profilePicture location'
				}]
			}
			let filter = {
				post: req.params.param1
			}
			dbModel.posts_likes.paginate(filter, options)
				.then(async result => {

					resolve(result)
				})
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}

function getComments(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let options = {
				page: req.query.page || 1,
				limit: req.query.pageSize || 50,
				sort: { _id: -1 },
				populate: [{
					path: 'commentBy',
					select: '_id name username role profilePicture location'
				}]
			}
			let filter = {
				post: req.params.param1
			}
			dbModel.posts_comments.paginate(filter, options)
				.then(async result => {

					resolve(result)
				})
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}


function addNewComment(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			// if (!req.params.param2) return reject(`param2 required`)
			let postDoc = await dbModel.posts.findOne({ _id: req.params.param1 })
			if (!postDoc) return reject(`post not found`)
			let comment = (req.getValue('text') || '').trim()
			if (!comment) return reject(`text required`)

			const newCommentDoc = new dbModel.posts_comments({
				post: postDoc._id,
				commentBy: sessionDoc.user,
				text: comment,
			})
			newCommentDoc.save()
				.then(async newCommentDoc => {
					postDoc.commentCount++
					await postDoc.save()
					resolve(newCommentDoc)
				})
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}


function like(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			// if (!req.params.param2) return reject(`param2 required`)
			let doc = await dbModel.posts.findOne({ _id: req.params.param1 })
			if (!doc) return reject(`post not found`)
			let oldStatus = false
			if (await dbModel.posts_likes.countDocuments({ post: doc._id, likedBy: sessionDoc.user }) > 0) {
				oldStatus = true
				await dbModel.posts_likes.deleteOne({ post: doc._id, likedBy: sessionDoc.user })
				if (doc.likeCount > 0) doc.likeCount--
			} else {
				oldStatus = false
				const likeDoc = new dbModel.posts_likes({ post: doc._id, likedBy: sessionDoc.user })
				await likeDoc.save()
				doc.likeCount++
			}

			doc.save()
				.then(doc => {
					let obj = doc.toJSON()
					obj.liked = !oldStatus
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
				.populate([{
					path: 'author',
					select: '_id name username role profilePicture location'
				}])
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
