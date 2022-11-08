const router = require("express").Router();
const Lock = require("../models/Lock.js");
const User = require("../models/User.js");
const Log = require("../models/Log.js");
const verify = require("./verifyToken");
const jwt = require("jsonwebtoken");

router.post("/getByLockId", verify, async (req, res) => {
  const lock = await Lock.findById(req.body.id);
  const logFilter = { lockId: lock._id };
  const logDescSort = { createdAt: -1 };
  const logTemp = await Log.find(logFilter).sort(logDescSort);
  const log = logTemp[0];
  if (log) {
    const user = await User.findById(log.userId);
    const retObj = {
      username: user.username,
      isLocked: log.isLocked,
      updatedAt: log.updatedAt,
    };

    try {
      res.send(retObj);
    } catch (err) {
      res.status(400).send(err);
    }
  } else {
    try {
      res.send("cannot get logs");
    } catch (err) {
      res.status(400).send(err);
    }
  }
});

router.post("/getByLockIdAll", verify, async (req, res) => {
  const lock = await Lock.findById(req.body.id);
  const logFilter = { lockId: lock._id };
  const log = await Log.find(logFilter);
  console.log(log);

  var itemsProcessed = 0;
  const getLogs = async (logTemp) => {
    if (logTemp) {
      const user = await User.findById(logTemp.userId);
      const retObj = {
        username: user.username,
        isLocked: logTemp.isLocked,
        updatedAt: logTemp.updatedAt,
      };

      logArr.push(retObj);
      itemsProcessed++;

      if (itemsProcessed === log.length) {
        res.send(logArr);
      }
    }
  };
  let logArr = [];
  log.forEach((logTemp) => {
    getLogs(logTemp);
  });

  // try {
  //   res.send(logArr);
  // } catch (err) {
  //   res.status(400).send(err);
  // }
});

router.post("/setLog", verify, async (req, res) => {
  const token = req.header("auth-token");
  const lock = await Lock.findById(req.body.id);
  const userId = await jwt.decode(token)._id;

  let log = new Log({
    lockId: lock._id,
    isLocked: lock.isLocked,
    userId: userId,
  });
  try {
    await log.save();
  } catch (err) {
    res.status(400).send(err);
  }
  res.send("Log Saved Successfully");
});

module.exports = router;
