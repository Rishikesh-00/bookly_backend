const express=require('express');
const {CreateAccount, LoginUser,CheckUser,UpdatePassword}=require('../Controller/Auth');
const router=express.Router();
router.post('/Createuser',CreateAccount)
    .post('/login',LoginUser)
    .post('/check',CheckUser)
    .post('/updatepassword',UpdatePassword)
exports.router=router;