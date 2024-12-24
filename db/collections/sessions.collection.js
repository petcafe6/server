// const { permissionSchemaType } = require('../../helpers/db-types')
const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      user: { type: ObjectId, ref: 'users', index: true },
      loginProvider: { type: String, default: '', index: true },
      deviceId: { type: String, default: '', index: true },
      closed: { type: Boolean, default: false, index: true },
      lastOnline: { type: Date, default: Date.now, index: true },
      lastIP: { type: String, default: '' },
      oauth2: { type: Object, default: null },
      requestHeaders: { type: Object, default: null },
    },
    { versionKey: false, timestamps: true }
  )

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  return model
}
