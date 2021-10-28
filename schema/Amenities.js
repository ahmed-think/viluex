const mongoose=require('mongoose')
const amenitiesSchema=new mongoose.Schema
({
    enabled:{type:Boolean,default:true},
    amenityName:String
})
module.exports=mongoose.model('amenities',amenitiesSchema)