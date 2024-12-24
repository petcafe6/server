const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      name: { type: String, required: true },
      username: { type: String, default: null, index: true },
      email: { type: String, default: null, index: true },
      phoneNumber: { type: String, default: null, index: true },
      password: { type: String, default: null, index: true },
      role: { type: String, enum: ['pet_owner', 'business'], default: 'pet_owner' },
      profilePicture: { type: String },
      gender: { type: String, default: '', enum: ['', 'male', 'female', 'other'] },
      dateOfBirth: { type: String, default: '2000-01-01', min: 10, max: 10 },
      bio: { type: String, default: '' },
      location: { type: String, default: '', index: true }
      // location: {
      //   type: { type: String, enum: ['point'], required: false, default: 'point' },
      //   coordinates: { type: [Number], required: false }, // [longitude, latitude]
      // },
    },
    { versionKey: false, timestamps: true }
  )

  // schema.index({ location: '2dsphere' })

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  return model
}
