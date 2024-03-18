const crypto = require("crypto");
const { User } = require("../models/Auth");
// API used to create a new user with unique phone number
exports.CreateAccount = async (req, res) => {
  console.log("createapi called!");
  console.log(req.body);
  const exituser=await User.findOne({Phone_Number:req.body.Phone_Number})
  if(exituser){
    res.status(400).json({err:"User Exist"})
    return;
  }
  try {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(req.body.password, salt, 10000, 512, "sha512")
      .toString("hex");
    const user = new User({
      Username: req.body.username,
      Phone_Number: req.body.Phone_Number,
      salt: salt,
      hash: hash,
    });
    const doc = await user.save();

    res.status(201).json({
      username:doc.Username,
      Phone_Number:doc.Phone_Number,
      message:"Account Created!"
    })
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// API used to login valid user
exports.LoginUser = async (req, res) => {
  // console.log("login called")
  try {
    const user = await User.findOne({ Phone_Number: req.body.Phone_Number });
   
    // console.log(user)
    if (user) {
      const hash = crypto.pbkdf2Sync(
        req.body.password,
        user.salt,
        10000,
        512,
        "sha512"
      ).toString('hex');
      if (user.hash === hash) {
        res
          .status(200)
          .json({ username: user.Username, Phone_Number: user.Phone_Number });
      }
      res.status(401).json({ err: "Password Not Matched!" });
    }
  } catch (err) {
    res.status(302).json({ error: err.message });
  }
};

// API to check user existence
exports.CheckUser = async (req, res) => {
  const user = await User.findOne({ Phone_Number: req.body.Phone_Number });
  if (user) {
    res.json({ message: "User already exist" });
  } else {
    res.json({ message: "user not exist" });
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
      username: user.Username,
    });
};
