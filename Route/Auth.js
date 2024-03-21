const express=require('express');
const {CreateAccount, LoginUser,CheckUser,UpdatePassword}=require('../Controller/Auth');
const router=express.Router();
const passport=require('passport')
router.post('/Createuser',CreateAccount)
    .post('/login',passport.authenticate('local'),LoginUser)
    .post('/check',CheckUser)
    .post('/updatepassword',UpdatePassword)
exports.router=router;