const express = require('express')
const path = require('path')
const { PORT } = require('./config.js')

let app = express()

app.use('/images', express.static(path.join(__dirname, 'wwwroot/images')))

app.use(express.static('wwwroot'))
app.use(require('./routes/auth.js'))
app.use(require('./routes/models.js'))
app.use(require('./routes/mydata.js'))
app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}...`)
})
