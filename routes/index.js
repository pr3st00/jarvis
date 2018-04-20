var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/jarvis.html');
});

module.exports = router;
