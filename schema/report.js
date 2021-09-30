const mongoose=require('mongoose')

const ReportModel=new mongoose.Schema({
    reason:{type:String},
comments:{type:String},
email:{type:String,required:true},
linkid:{type:mongoose.Schema.Types.ObjectId,ref:"links"}
})

module.exports=mongoose.model('reports',ReportModel)