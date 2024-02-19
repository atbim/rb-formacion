const express = require('express')
let router = express.Router()

router.get('/api/mydata', async function (req, res, next) {
  try {
    const dbids = [11395, 13047, 13048]
    res.json({ dbids: dbids, status: 'success' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
