const express = require('express');
const mongoose=require('mongoose')
require('dotenv').config();
const uri="mongodb+srv://rishi:rishi@cluster0.yueo897.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const Server = express();
const port = process.env.PORT ;
const Authrouter=require("./Route/Auth")
Server.use(express.json())
Server.use('/Auth',Authrouter.router)

main().catch(err=>{console.log(err)})
async function main(){
    await mongoose.connect(uri)
    console.log("database connected!")
}

Server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
