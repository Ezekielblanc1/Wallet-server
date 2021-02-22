const { createUser } = require("../controllers/user");

const router = require("express").Router();

router.post('/register', createUser)

module.exports = router;
