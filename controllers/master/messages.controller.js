module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		switch (req.method) {
			case 'GET':
				if (req.params.param1) {
					getMessages(dbModel, sessionDoc, req).then(resolve).catch(reject)
				} else {
					getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
				}

				break

			case 'POST':
				post(dbModel, sessionDoc, req).then(resolve).catch(reject)
				break

			default:
				restError.method(req, reject)
				break
		}
	} catch (err) {
		reject(err)
	}
})

function getMessages(dbModel, sessionDoc, req) {
	return new Promise(async (resolve, reject) => {
		try {
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



function getList(dbModel, sessionDoc, req) {
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

					resolve(result)
				})
				.catch(reject)

		} catch (err) {
			reject(err)
		}
	})
}
