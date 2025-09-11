const express = require("express");
const router = express.Router();
const { list, count, markRead, markAllRead } = require("../Controllers/mentorNotificationController");
const auth = require("../Middlewares/auth.middleware");

router.use(auth);

router.get("/", list); // ?mentorEmail=
router.get("/count", count); // ?mentorEmail=
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead);

module.exports = router;
