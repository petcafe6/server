const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      name: { type: String, required: true }, // Grup adı
      description: { type: String, default: '' }, // Grup açıklaması
      image: { type: String, default: null }, // Grup profil fotoğrafı
      admins: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true } // Grup yöneticileri
      ],
      members: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true } // Grup üyeleri
      ],
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
