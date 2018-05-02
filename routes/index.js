const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/jarvis.html');
});

module.exports = router;
