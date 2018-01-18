var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
    res.json({ text : "Text is : " + req.body.text});
});

module.exports = router;
