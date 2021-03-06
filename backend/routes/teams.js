const express = require('express');
const router = express.Router();

const WalletModel = require('../models/walletModel');
const TeamModel = require('../models/teamModel');
const TeamHasUserModel = require('../models/TeamHasUserModel');
const EventModel = require('../models/eventModel');

const config = require("../config/default.json");
const { convertToRegularDateTime } = require("../utils/helper");

const multer = require("multer");
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config(config.CLOUDINARY);
const { v1: uuidv1 } = require('uuid');
const v1options = { msecs: Date.now() };
uuidv1(v1options);
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));// make filename unique in images folder (if happen)
  },
  destination: function (req, file, cb) {
    cb(null, `./public/images/teamAvatars`);
  },
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const teams = await TeamModel.getAllTeam();
  return res.status(200).send({ teams });
})

router.get('/:userId', async (req, res) => {
  const userID = req.params.userId;
  const teams = await TeamModel.getTeamsByUserId(userID);
  return res.status(200).send({ teams });
})

router.get('/details/:teamID', async (req, res) => {
  const teamID = req.params.teamID;
  const teams = await TeamModel.getTeamById(teamID);
  if (teams.length === 1) {
    return res.status(200).send({ teams });
  } else {
    return res.status(404).send({ msg: "Không tìm thấy nhóm." })
  }
})

router.get('/:teamID/members', async (req, res) => {
  const teamID = req.params.teamID;
  const thu = await TeamModel.getMembersByTeamId(teamID);
  if (thu.length !== 0) {
    return res.status(200).send({ members: thu });
  } else {
    return res.status(404).send({ msg: "Không tìm thấy nhóm." })
  }
})

router.get('/:teamID/users', async (req, res) => {
  const teamID = req.params.teamID;
  const users = await TeamHasUserModel.getTHUByTeamId(teamID);
  if (users.length >= 1) {
    return res.status(200).send({ users });
  } else {
    return res.status(200).send({ users: [] });
  }
})

router.post('/:teamID/roles', async (req, res) => {
  const teamID = req.params.teamID;
  const { userID } = req.body;
  const info = await TeamHasUserModel.getTHUByUserIdAndTeamID(userID, teamID);
  if (info.length === 0) {
    return res.status(400).send({ msg: "Không tìm thấy nhóm." })

  } else {
    return res.status(200).send({ info: info[0] });
  }
})

router.post('/:userID', async (req, res) => {
  const { Name, MaxUsers, Description } = req.body;
  const userID = req.params.userID;
  const newWallet = {
    ID: uuidv1(),
    TotalCount: 0,
    CurrentIncomeCount: 0,
    CurrentSpentCount: 0,
    DateModified: convertToRegularDateTime(new Date())
  }
  const teamWallet = await WalletModel.addWallet(newWallet);

  if (teamWallet.affectedRows !== 1) {
    return res.status(500)
      .send({ msg: "Hãy thử lại." });
  }

  const newTeam = {
    ID: uuidv1(),
    Name,
    MaxUsers,
    Description,
    CreatedDate: convertToRegularDateTime(new Date()),
    WalletID: newWallet.ID,
  };
  const team = await TeamModel.createTeam(newTeam);
  if (team.affectedRows !== 1) {
    return res.status(500)
      .send({ msg: "Hãy thử lại." });
  }

  const admin = {
    UserID: userID,
    TeamID: newTeam.ID,
    Role: config.PERMISSION.ADMIN,
    Status: config.STATUS.ACTIVE
  }
  const result = await TeamHasUserModel.createTHU(admin);

  if (result.affectedRows === 1) {
    return res.status(201)
      .send({ msg: "Tạo nhóm thành công.", result: newWallet.ID });
  } else {
    return res.status(500)
      .send({ msg: "Hãy thử lại." });
  }
})

router.patch('/:id/avatar', upload.single('avatar'), async (req, res) => {
  const teamId = req.params.id;
  const teamObject = await TeamModel.getTeamById(teamId);

  if (teamObject.length === 0) {
    return res.status(400).send({ msg: "Không tìm thấy người dùng" })
  }

  const team = teamObject[0];

  if (team.AvatarURL !== null) {
    const firstIndex = team.AvatarURL.lastIndexOf("avatar/");
    const secondIndex = team.AvatarURL.lastIndexOf(".");
    const oldPublicId = team.AvatarURL.substring(firstIndex, secondIndex);
    cloudinary.uploader.destroy(oldPublicId, result => { console.log(result) });
  }

  const filePath = req.file.path;
  const uniqueFilename = Date.now();
  cloudinary.uploader.upload(
    filePath,
    {
      public_id: `avatar/${uniqueFilename}`,
      tags: 'avatar'
    },
    async (err, image) => {

      if (err) {
        return res.status(500).send({ msg: "Đã xảy ra sự cố khi tải lên ảnh của bạn. Hãy thử lại!" });
      }
      fs.unlinkSync(filePath);
      await TeamModel.updateTeam(teamId, { AvatarURL: image.url });
      return res.status(200).json({ url: image.url });
    }
  )
});

router.put('/details/:id', async (req, res) => {
  const teamId = req.params.id;
  const { Name, MaxUsers, Description, UserID } = req.body;
  const teamObject = await TeamModel.getTeamByIdAndUserId(teamId, UserID);

  if (teamObject.length === 0) {
    return res.status(400).send({ msg: "Không tìm thấy nhóm hoặc bạn không có quyền để thực hiện hành động." })
  }

  const thu = await TeamHasUserModel.getTHUByTeamId(teamId);
  if (thu.length > MaxUsers) {
    return res.status(400).send({ msg: "Số lượng thành viên lớn hơn số lượng tối đa vừa thay đổi." })
  }

  const update = TeamModel.updateTeam(teamId, { Name, MaxUsers, Description });
  res.send(update);
});

router.post('/:id/leave', async (req, res) => {
  const walletId = req.params.id;
  const teamObject = await TeamModel.getTeamByWalletId(walletId);
  const { UserID } = req.body;
  if (teamObject.length === 0) {
    return res.status(400).send({ msg: "Không tìm thấy nhóm." })
  }

  const team = teamObject[0];
  // Remove user from team
  const c = await TeamHasUserModel.leaveTHU(team.ID, UserID)
  return res.status(200).send({ msg: "Thành công." })

});

router.post('/remove/:userId', async (req, res) => {
  const userID = req.params.userId;
  const { teamID } = req.body;
  const c = await TeamHasUserModel.leaveTHU(teamID, userID)
  return res.status(200).send({ msg: "Thành công." })
})

router.post('/:id/delete', async (req, res) => {
  const walletId = req.params.id;
  const teamObject = await TeamModel.getTeamByWalletId(walletId);
  const { UserID } = req.body;
  if (teamObject.length === 0) {
    return res.status(400).send({ msg: "Không tìm thấy nhóm." })
  }

  const team = teamObject[0];
  // Remove user from team
  const c = await TeamHasUserModel.deleteTHU(team.ID)
  const d = await TeamModel.deleteTeam(team.ID);
  const e = await EventModel.EndAllEventByWalletID(team.WalletID);
  return res.status(200).send({ msg: "Thành công." })

});

router.post('/join/:userId', async (req, res) => {
  const userID = req.params.userId;
  const { teamID } = req.body

  const team = await TeamModel.getTeamById(teamID);
  const thu = await TeamHasUserModel.getTHUByTeamId(teamID);
  if (team.length === 0) {
    return res.status(404).send({ msg: "Không tìm thấy nhóm." });
  }
  if (thu && thu.find(i => i.UserID === userID)) {
    return res.status(500).send({ msg: "Bạn đã là thành viên của nhóm." });
  }
  if ((team[0].MaxUsers > thu.length) && (!thu.includes(userID))) {
    const thuObject = {
      TeamID: teamID,
      UserID: userID,
      Role: config.PERMISSION.MEMBER,
      Status: config.STATUS.ACTIVE
    }
    const result = await TeamHasUserModel.createTHU(thuObject);
    if (result.affectedRows === 1) {
      return res.status(201)
        .send({ msg: "Bạn vừa gia nhập vào nhóm.", result: team[0].WalletID });
    } else {
      return res.status(500)
        .send({ msg: "Xin hãy thử lại." });
    }
  } else {
    res.status(500)
      .send({ msg: "Nhóm đã đủ số lượng thành viên" });
  }
})

module.exports = router;