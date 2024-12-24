const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'business', required: true },
      pet: { type: mongoose.Schema.Types.ObjectId, ref: 'pets', required: true },
      service: { type: String, required: true }, // Örn: "Aşı", "Tıraş"
      date: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
      notes: { type: String }, // Kullanıcı notları
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
