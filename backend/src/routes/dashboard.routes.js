const express = require("express");
const { dashboardSummary } = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);

router.get("/summary", dashboardSummary);

module.exports = router;
