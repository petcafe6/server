const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true }, // Mesajı gönderen
      conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'conversations', required: true, index: true }, // Bağlı olduğu konuşma
      content: { type: String, default: null }, // Mesaj içeriği
      media: [{ type: mongoose.Schema.Types.ObjectId, ref: 's3images' }],
      isSystemMessage: { type: Boolean, default: false }, // Sistem mesajı (örn. birinin gruba katılması)
      isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
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
