const crypto = require("crypto");
const { User } = require("../models/Auth");
const jwt=require('jsonwebtoken');
const { sentizeuser } = require("../Common");
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;
// API used to create a new user with unique phone number

exports.CreateAccount = async (req, res) => {
  console.log(req.body.Username)
  const user=await User.findOne({Phone_Number:req.body.Phone_Number})
    if(user){
      res.status(301).json({error:"User already exist"})
      return;
    }
    try{
      const salt=crypto.randomBytes(16);
      crypto.pbkdf2(req.body.password,salt,31000,32,'sha256', async function(err,hashedpassword){
        const newuser=new User({Username:req.body.Username,Phone_Number:req.body.Phone_Number,hash:hashedpassword,salt})
        const doc=await newuser.save();
        const token=jwt.sign(sentizeuser(doc),SECRET_KEY);
        res.cookie('jwt',(token),{
          expires:new Date(Date.now()+36000000),
          httpOnly:true
        }).status(200).json({Username:doc.Username,Phone_Number:doc.Phone_Number})

      })
    }
    catch(err){
      res.status(400).json({error:err.message});
    }
  
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
      Username: req.body.Username,
      Phone_Number: req.body.Phone_Number,
      salt: salt,
      hash: hash,
    });
    const doc = await user.save();

    res.status(201).json({
      Username:doc.Username,
      Phone_Number:doc.Phone_Number,
      message:"Account Created!"
    })
  } catch (err) {
    res.status(401).json({ error: err.message });
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
      Username: user.Username,
    });
};
