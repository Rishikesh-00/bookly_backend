const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    Username:{type:String,unique:true,required:[true,"Username is required"], index: true},
    Phone_Number:{type:String,unique:true,required:[true,"Phone Number is required"],unique:true,index:true},
    salt:String,
    hash:String,
    cart:mongoose.Schema.Types.ObjectId,
    Address:mongoose.Schema.Types.ObjectId,
    Order:mongoose.Schema.Types.ObjectId,
},{timestamps:true})

exports.User= mongoose.model("User",userSchema)