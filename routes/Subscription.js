const express=require('express')
const HandleSuccess=require('../handle function/handlesucces')
const HandleErr=require('../handle function/error')
const Subscription = require('../schema/Subscription')
const router=express.Router()

router.post('/addsubscription',(req,res)=>{
    let data={
        subscription_name:req.body.subscription_name,
        price:req.body.price,
        duration:req.body.duration
    }
    Subscription.create(data,(err,doc)=>{
        if(err){
            return res.json(HandleErr(err))
        }
        else{
            return res.json(HandleSuccess(doc))
        }
    })
})

//delete
router.delete('/deletesubscription',(req,res)=>{
    Subscription.findByIdAndDelete(req.body.id,(err,doc)=>{
        if(err){
            return res.json(HandleErr(err))
        }
        else{
            return res.json(HandleSuccess(doc))
        }
    })
})

//update
router.post('/updatesubscription',(req,res)=>{
    if(req.body.id && req.body.subscription_name){
    Subscription.findByIdAndUpdate(req.body.id,{subscription_name:req.body.subscription_name},{new:true},(err,doc)=>{
        if(err){
            return res.json(HandleErr(err))
        }
        else{
            return res.json(HandleSuccess(doc))
        }
    })
    }
    else if(req.body.id && req.body.price){
        Subscription.findByIdAndUpdate(req.body.id,{price:req.body.price},{new:true},(err,doc)=>{
            if(err){
                return res.json(HandleErr(err))
            }
            else{
                return res.json(HandleSuccess(doc))
            }
        })
        }
    else if(req.body.id && req.body.duration){
            Subscription.findByIdAndUpdate(req.body.id,{duration:req.body.duration},{new:true},(err,doc)=>{
                if(err){
                    return res.json(HandleErr(err))
                }
                else{
                    return res.json(HandleSuccess(doc))
                }
            })
            }
    else{
        return res.json({message:"Invalid Parameters"})
    }
})

//get all subscription
router.get('/getsubscriptions',(req,res)=>{
    Subscription.find({},(err,doc)=>{
        if(err){
            return res.json(HandleErr(err))
        }
        else{
            return res.json(HandleSuccess(doc))
        }
    })
})

//enabled subscription
router.get('/showenabledsubscriptions',(req,res)=>{
    Subscription.find({enabled:true},(err,doc)=>{
        if(err){
            return res.json(HandleErr(err))
        }
        else{
            return res.json(HandleSuccess(doc))
        }
    })
})


module.exports=router