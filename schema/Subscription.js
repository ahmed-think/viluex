const mongoose=require('mongoose')
const subscriptionSchema=new mongoose.Schema({
    enabled:{type:Boolean,default:true},
    subscription_name:{type:String ,required:"subscription name required"},
    price:{type:Number,required:"price is required"},
    duration:{type:Number,min:00,max:90,required:"duration is required"},
    //listing expiry_date:Date
})
module.exports=mongoose.model('subscriptions',subscriptionSchema)