const router = require("express").Router();
const isAuth = require('../middleware/isAuth')
const { deposit, transfer } = require("../controllers/accounts");

router.post("/deposit",isAuth, deposit);
router.post('/transfer', isAuth, transfer)
module.exports = router;
