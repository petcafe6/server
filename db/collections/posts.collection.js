const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
      content: { type: String, required: true, index: true },
      images: [{ type: mongoose.Schema.Types.ObjectId, ref: 's3images' }],
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // Beğenen kullanıcılar
      comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
      }],
      hashTags: [{ type: String, required: true, index: true }],
      mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
      location: { type: String, default: '', index: true }
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
