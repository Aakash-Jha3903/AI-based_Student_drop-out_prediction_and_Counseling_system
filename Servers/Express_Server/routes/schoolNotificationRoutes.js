const express = require("express");
const router = express.Router();
const { list, count, markRead, markAllRead } = require("../Controllers/schoolNotificationController");
const auth = require("../Middlewares/auth.middleware");

router.use(auth);

router.get("/", list); // school resolved from token user (Role 5)
router.get("/count", count);
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead);

module.exports = router;
