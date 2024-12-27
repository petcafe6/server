const errorImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjNwitOkVehY1hzubk6LHbM6T4JLxZ-VXYJG1ufypJiFosTCUdOTkXVpUo2wfGc2nlY3Q&usqp=CAU'
module.exports = (dbModel, req, res) => new Promise(async (resolve, reject) => {
  try {

    if (req.params.param1) {
      const w = req.params.param2 || req.query.w || ''
      const doc = await dbModel.s3images.findOne({ _id: req.params.param1 })
      let imageSrc = ''
      if (doc) {
        switch (w) {
          case '800':
            imageSrc = doc.img800.src
            break
          case '400':
            imageSrc = doc.img400.src
            break
          case '200':
            imageSrc = doc.img200.src
            break
          case '100':
            imageSrc = doc.img100.src
            break
          default:
            imageSrc = doc.src
            break
        }
        if (imageSrc == '') imageSrc = doc.src
        res.redirect(imageSrc)
      } else {
        res.redirect(errorImageUrl)
      }
    } else {
      res.redirect(errorImageUrl)
    }

  } catch (err) {
    devError(err)
    res.redirect(errorImageUrl)
  }
})