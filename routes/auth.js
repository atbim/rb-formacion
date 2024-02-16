const express = require('express')
const { getPublicToken } = require('../services/aps.js')

let router = express.Router()

router.get('/api/auth/token', async function (req, res, next) {
  try {
    res.json(await getPublicToken())
  } catch (err) {
    next(err)
  }
})

router.get('/api/auth/test', async function (req, res, next) {
  try {
    res.json({ message: 'Hola Adrián!!!' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
