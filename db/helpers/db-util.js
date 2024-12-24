exports.dbNull = (doc, reject) => {
  if (doc) return true
  if (reject) {
    reject('Not found')
    return false
  } else throw 'Not found'
}


exports.epValidateSync = (doc, reject) => {
  let err = doc.validateSync()
  if (err) {
    let keys = Object.keys(err.errors)
    let errList = []
    keys.forEach((e) => errList.push(err.errors[e].message))

    reject(errList.join('\n'))
    return false
  } else {
    return true
  }
}

exports.connectionString = () => {
  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
  } = process.env

  return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
}