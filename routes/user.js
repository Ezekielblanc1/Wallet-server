const { createUser, loginUser } = require("../controllers/user");
const { createProfile } = require('../controllers/profile')
const isAuth = require('../middleware/isAuth')
const router = require("express").Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post('/createProfile',isAuth, createProfile)

module.exports = router;
