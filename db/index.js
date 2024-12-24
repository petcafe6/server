global.mongoose = require('mongoose')
global.mongoosePaginate = require('mongoose-paginate-v2')
global.mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
mongoosePaginate.paginate.options = {
  customLabels: {
    totalDocs: 'totalDocs',
    limit: 'pageSize',
    page: 'page',
    totalPages: 'pageCount',
    docs: 'docs',
    nextPage: 'false',
    prevPage: 'false',
    pagingCounter: 'false',
    hasPrevPage: 'false',
    hasNextPage: 'false',
    meta: null,
  },
  lean: true,
  leanWithId: false,
  limit: 10,
  allowDiskUse: true,
}
global.ObjectId = mongoose.Types.ObjectId

global.dbNull = require('./helpers/db-util').dbNull
global.epValidateSync = require('./helpers/db-util').epValidateSync
global.sendToTrash = require('./helpers/db-util').sendToTrash


mongoose.set('debug', false)
mongoose.Schema.Types.String.set('trim', true)

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    eventLog('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

global.db = {
  get nameLog() {
    return `[MongoDB]`.cyan
  },
}

module.exports = () =>
  new Promise((resolve, reject) => {
    connectMongoDatabase('collections', process.env.MONGODB_URI, db)
      .then(() => {
        resolve()
      })
      .catch(reject)
  })


function connectMongoDatabase(collectionFolder, mongoAddress, dbObj) {
  return new Promise((resolve, reject) => {
    if (collectionFolder && mongoAddress && !dbObj.conn) {
      collectionLoader(path.join(__dirname, collectionFolder), '.collection.js')
        .then((holder) => {
          dbObj.conn = mongoose.createConnection(mongoAddress, { autoIndex: true })
          dbObj.conn.on('connected', () => {
            Object.keys(holder).forEach((key) => {
              dbObj[key] = holder[key](dbObj)
            })
            if (dbObj.conn.active != undefined) {
              eventLog(dbObj.nameLog, 're-connected')
            } else {
              eventLog(dbObj.nameLog, mongoAddress, 'connected')
            }
            dbObj.conn.active = true
            resolve(dbObj)
          })

          dbObj.conn.on('error', (err) => {
            dbObj.conn.active = false
            reject(err)
          })

          dbObj.conn.on('disconnected', () => {
            dbObj.conn.active = false
            eventLog(dbObj.nameLog, 'disconnected')
          })
        })
        .catch((err) => {
          reject(err)
        })
    } else {
      resolve(dbObj)
    }
  })
}

function collectionLoader(folder, suffix) {
  return new Promise((resolve, reject) => {
    try {
      let collectionHolder = {}
      let files = fs.readdirSync(folder)
      files.forEach((e) => {
        let f = path.join(folder, e)
        if (!fs.statSync(f).isDirectory()) {
          let fileName = path.basename(f)
          let apiName = fileName.substr(0, fileName.length - suffix.length)
          if (apiName != '' && apiName + suffix == fileName) {
            collectionHolder[apiName] = require(f)
          }
        }
      })
      resolve(collectionHolder)
    } catch (err) {
      reject(err)
    }
  })
}
