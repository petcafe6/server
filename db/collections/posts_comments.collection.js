const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true, index: true },
      commentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
      text: { type: String, required: true },
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
