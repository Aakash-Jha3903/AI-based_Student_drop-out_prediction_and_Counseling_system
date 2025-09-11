const express = require("express");
const router = express.Router();
const { list, count, markRead, markAllRead } = require("../Controllers/notificationController");
const auth = require("../Middlewares/auth.middleware");

router.use(auth);

router.get("/", list); // expects ?studentId=
router.get("/count", count); // expects ?studentId=
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead); // expects { studentId }

module.exports = router;
