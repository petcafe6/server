const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      name: { type: String, required: true },
      type: { type: String, enum: ['pet_shop', 'veterinarian', 'pet_hotel', 'other'], required: true }, // İşletme türü
      description: { type: String },
      location: {
        type: { type: String, enum: ['point'], required: true, default: 'point' },
        coordinates: { type: [Number], required: true }
      }, // Konum bilgisi
      services: [{ type: String }], // Sağlanan hizmetler listesi
      workingHours: [{
        day: { type: Number, min: 0, max: 6 },
        start: { type: String },  // Örn: "08:00"
        end: { type: String },    // Örn: "18:00"
      }],
    },
    { versionKey: false, timestamps: true }
  )

  schema.index({ location: '2dsphere' })

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  return model
}
