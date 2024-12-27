const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
      content: { type: String, required: true, index: true },
      images: [{ type: mongoose.Schema.Types.ObjectId, ref: 's3images' }],
      hashtags: [{ type: String, required: true, index: true }],
      mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true }],
      location: { type: String, default: '', index: true },
      likeCount: { type: Number, default: 0, index: true },
      commentCount: { type: Number, default: 0, index: true },
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
