const mongoose=require('mongoose')

const LinkModel=new mongoose.Schema({
    email:{type:String,unique:true},
    Category:{type:mongoose.Schema.Types.ObjectId,ref:'catagories'},
    Title:{type:String},
    Short_description:{type:String},
    pasword:{type:String},
    Description:{type:String},
    Starting_price:{type:Number},
    Amenities:[{type:String}],
    Opening :{type:String},
    closinghours:{type:String},
    Images:[{type:String}],
    Cover:{type:String},
    City:{type:String},
    isloggedin:{type:Boolean,default:true},
    Location:[{type:Number}],//longitude,latitude
    Complete_address:{type:String},
    Contact_Number:{type:Number},
    Tags:[{type:String}],
    ratings:{type:Number,default:0},
    created_date:{
        type:Date,
        default:Date.now()
    },
    reviews:[ReviewModel],
    hits:{
        type:Number,
        min:0,
        default:0
    }
})

module.exports=mongoose.model('links',LinkModel)