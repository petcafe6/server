const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  const schema = mongoose.Schema(
    {
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      name: { type: String, required: true },
      type: { type: String, enum: ['dog', 'cat', 'bird', 'reptile', 'fish', 'other'], required: true },
      breed: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female'] },
      medicalRecords: [
        {
          date: { type: Date },
          notes: { type: String },
          vet: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
      ],
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