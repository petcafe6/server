module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		switch (req.method) {
			case 'GET':
				if (req.params.param1) {
					getMessages(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					getConversations(dbModel, sessionDoc, req).then(resolve).catch(reject)
				}

				break

			case 'POST':
				post(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break
			case 'DELETE':
				if (req.params.param1 == 'deleteMessage' && req.params.param2) {
					deleteMessage(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else if (req.params.param1 == 'deleteConversation' && req.params.param2) {
					deleteConversation(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					reject(`param1 and param2 required`)
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

function deleteMessage(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			if (await dbModel.messages.countDocuments({ _id: req.params.param2, sender: sessionDoc.user }) == 0)
				return reject(`message not found`)
			dbModel.messages
				.deleteOne({ _id: req.params.param2, sender: sessionDoc.user })
				.then(resolve)
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}
function deleteConversation(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let conversationDoc = await dbModel.conversations.findOne({
				_id: req.params.param2,
				participants: { $all: [sessionDoc.user] },
				type: 'direct'
			})
			if (!conversationDoc) return reject(`conversation not found`)

			await dbModel.messages.deleteMany({ conversation: conversationDoc._id }, { multi: true })
			dbModel.conversations
				.deleteOne({ _id: conversationDoc._id })
				.then(resolve)
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}

function getMessages(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			const conversationDoc = await dbModel.conversations.findOne({ _id: req.params.param1 })
			let options = {
				page: req.query.page || 1,
				limit: req.query.pageSize || 50,
				sort: { _id: -1 },
				populate: [{
					path: 'sender',
					select: '_id name username role profilePicture location'
				}]
			}
			let filter = { conversation: req.params.param1 }
			dbModel.messages.paginate(filter, options)
				.then(async result => {

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
			const to = req.getValue('to')
			const content = req.getValue('content')
			let media = req.body.media || []
			if (!to) return reject(`to parameter required`)
			if (!content) return reject(`content required`)
			if (media && !Array.isArray(media)) {
				media = [media]
			}
			const toDoc = await dbModel.users.findOne({ _id: to })
			if (!toDoc) return reject(`user not found`)

			let conversationDoc = await dbModel.conversations.findOne({
				participants: { $all: [toDoc._id, sessionDoc.user] },
				type: 'direct'
			})
			if (!conversationDoc) {
				conversationDoc = new dbModel.conversations({
					type: 'direct',
					participants: [sessionDoc.user, toDoc._id],
					group: null
				})
				conversationDoc = await conversationDoc.save()
			}

			let messageDoc = new dbModel.messages({
				sender: sessionDoc.user,
				conversation: conversationDoc._id,
				content: content,
				media: media,
				isSystemMessage: false,
				isReadBy: []
			})
			messageDoc
				.save()
				.then(resolve)
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}



function getConversations(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
			let options = {
				page: req.query.page || 1,
				limit: req.query.pageSize || 50,
				sort: { _id: -1 },
				populate: [{
					path: 'participants',
					select: '_id name username role profilePicture location'
				},
				{
					path: 'group'
				}]
			}
			let filter = {

			}
			dbModel.conversations.paginate(filter, options)
				.then(async result => {
					let i = 0
					while (i < result.docs.length) {
						let e = result.docs[i]
						if (e.type == 'direct') {
							if (e.participants.length > 1) {
								if (e.participants[0]._id.toString() == sessionDoc.user) {
									e.user = e.participants[1]
								} else {
									e.user = e.participants[0]
								}
							}
						}
						result.docs[i] = e
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
