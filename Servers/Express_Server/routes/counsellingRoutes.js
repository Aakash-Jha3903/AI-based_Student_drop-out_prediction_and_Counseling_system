const express = require("express");
const router = express.Router();
const counsellingController = require("../Controllers/counsellingController");


router.post("/meetrequest/:school_obj_id", counsellingController.requestCounselling);
router.put("/schedule/:meetID", counsellingController.scheduleMeeting);
router.put("/addlink/:meetID", counsellingController.addMeetingLink);
router.put("/conclude/:meetID", counsellingController.concludeMeeting);
router.put("/satisfaction/:meetID", counsellingController.updateSatisfaction);
router.get("/school/:schoolID", counsellingController.getCounsellingBySchool);

module.exports = router;