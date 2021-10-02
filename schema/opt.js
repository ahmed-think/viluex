const mongoose=require('mongoose')


const OtpModel=new mongoose.Schema({
    email:{type:String},
    otp:String
})


module.exports=mongoose.model('otps',OtpModel)