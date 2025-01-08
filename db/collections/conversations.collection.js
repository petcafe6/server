const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      type: { type: String, enum: ['direct', 'group'], required: true }, // 'direct' veya 'group'
      participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true }
      ], // Bireysel konuşmalarda kullanıcılar
      group: { type: mongoose.Schema.Types.ObjectId, ref: 'groups', default: null, index: true }, // Grup konuşmaları için grup referansı
      // messages: [
      //   { type: mongoose.Schema.Types.ObjectId, ref: 'messages' } // Mesajlar
      // ],
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
