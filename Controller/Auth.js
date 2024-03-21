const crypto = require("crypto");
const { User } = require("../models/Auth");
const jwt=require('jsonwebtoken');
const { sentizeuser } = require("../Common");
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;
// API used to create a new user with unique phone number

exports.CreateAccount = async (req, res) => {
  try {
      const existingUser = await User.findOne({ Phone_Number: req.body.Phone_Number });
      if (existingUser) {
          return res.status(301).json({ error: "User already exists" });
      }

      const salt = crypto.randomBytes(16);
      const hashedPassword = await new Promise((resolve, reject) => {
          crypto.pbkdf2(req.body.password, salt, 31000, 32, 'sha256', (err, hashedpassword) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(hashedpassword);
              }
          });
      });

      const newUser = new User({
          Username: req.body.Username,
          Phone_Number: req.body.Phone_Number,
          hash: hashedPassword,
          salt: salt
      });

      const doc = await newUser.save();
      const token = jwt.sign(sentizeuser(doc), SECRET_KEY);

      res.cookie('jwt', token, {
          expires: new Date(Date.now() + 36000000),
          httpOnly: true
      }).status(200).json({ Username: doc.Username, Phone_Number: doc.Phone_Number });
  } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
  }
};


// API used to login valid user
exports.LoginUser = async (req, res) => {
 if(req.user){
  res.cookie('jwt' ,req.user.token,{
    expires: new Date(Date.now() + 600000),
    httpOnly:true,
  }).status(200).json({message:"Login SuceesFuly"})
 }
};


// API to check user existence
exports.CheckUser = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401)
  }
};
// API to update password
exports.UpdatePassword = async (req, res) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512, "sha512");

  const user = await User.findOneAndUpdate(
    { Phone_Number: req.body.Phone_Number },
    { hash: hash }
  );
  res
    .status(200)
    .json({
      message: "Password Updated Successfully!",
      Username: user.Username,
    });
};
