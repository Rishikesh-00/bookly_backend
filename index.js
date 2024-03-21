const express = require('express');
const mongoose=require('mongoose');
const cors=require('cors')
require('dotenv').config();
const uri="mongodb+srv://rishi:rishi@cluster0.yueo897.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const Server = express();

const Authrouter=require("./Route/Auth")
const session=require('express-session');
const { User } = require('./models/Auth');
const passport=require('passport')
const LocalStrategy=require('passport-local').Strategy;
const crypto=require("crypto");
const jwt=require("jsonwebtoken");
const port = process.env.PORT ;
const SECRET_KEY=process.env.SECRET_KEY;
const { sentizeuser } = require('./Common');
const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var opts={}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;


Server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false,maxAge:600000 }
}))
Server.use(cors())
Server.use(express.json())
Server.use('/Auth',Authrouter.router)

passport.use('local' , new LocalStrategy({usernameField:"Phone_Number"},
async function(Phone_Number, password, done) {
  try {
   console.log('Working')
   const user = await User.findOne({Phone_Number:Phone_Number});
   console.log('Working')
   if(!user){
      return done(null , false ,{error:"User Not Exist"})
   }
   crypto.pbkdf2(password, user.salt, 31000,32,'sha256', async function (err,hash){
      if(!crypto.timingSafeEqual(user.hash,hash)){
         return done(null,false, {error:"Wrong Password "})
      }
      console.log('Working')
      const token = jwt.sign(sentizeuser(user),SECRET_KEY)
      done(null,{username:user.Username,Phone_Number:user.Phone_Number,token})
   })
  }
  catch (err){
   done(err)
  }
}
));


passport.use('jwt' ,new JwtStrategy(opts,async function(jwt_payload, done) {
  try {
     const user = await User.findOne({Phone_Number:jwt_payload.Phone_Number});
     if(user){
        return done(null, sentizeuser(user))
     }
     else {
        return done(null ,false ,{error:"Something Went Wrong"})
     }
  }
  catch (err){
     done(err)
  }
}));


passport.serializeUser(function(user, cb) {
  console.log('Serialzier stated')
  process.nextTick(function() {
   return cb(null, { Username: user.Username ,Phone_Number:user.Phone_Number });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

main().catch(err=>{console.log(err)})
async function main(){
    await mongoose.connect(uri)
    console.log("database connected!")
}

Server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
