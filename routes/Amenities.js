const express=require('express')
const handleErr = require('../handle function/error')
const handleSuccess = require('../handle function/handlesucces')
const Amenity=require('../schema/Amenities')
const router=express.Router()

router.post('/createamenity',(req,res)=>{
    let data=req.body
    Amenity.create(data,(err,doc)=>{
        if(err){
            return res.json(handleErr(err))
        }
        else{
            return res.json(handleSuccess(doc))
        }
    })
})

router.get('/getallamenities',(req,res)=>{
    Amenity.find({},(err,doc)=>{
        if(err){
            return res.json(handleErr(err))
        }
        else{
            return res.json(handleSuccess(doc))
        }
    })
})

router.post('/updateamenity',(req,res)=>{
    let data=req.body
    Amenity.findByIdAndUpdate(req.body.id,data,{new:true},(err,doc)=>{
        if(err){
            return res.json(handleErr(err))
        }
        else{
            return res.json(handleSuccess(doc))
        }
    })
})

router.delete('/deleteamenity',(req,res)=>{
    
    Amenity.findByIdAndDelete(req.body.id,(err,doc)=>{
        if(err){
            return res.json(handleErr(err))
        }
        else{
            return res.json(handleSuccess(doc))
        }
    })
})
module.exports=router