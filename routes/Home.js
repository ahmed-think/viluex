const express=require('express')
const category = require('../schema/category')
const handleErr=require('../handle function/error')
const handleSuccess=require('../handle function/handlesucces')
const links = require('../schema/links')
const Touristing = require('../schema/Touristing')
const router=express.Router()

router.post('/getall',(req,res)=>{
    // categories=[]
    if(req.body.latitude && req.body.longitude){
        console.log("hello")
        category.find({}).limit(7).exec((err,category)=>{
            if(err){
                return res.json(handleErr(err))
            }
            else{
               
                links.find({}).sort({ratings:-1}).limit(7).exec((err,toprated)=>{
                    if(err){
                        return res.json(handleErr(err))
                    }
                    else{
                        
                        links.find({ geometry: {
                            $nearSphere: {
                              $geometry: {
                                type: 'Point',
                                coordinates: [req.body.latitude, req.body.longitude], //longitude and latitude
                              },
                              $minDistance: 0,
                              $maxDistance: 25 * 1000,
                            },
                          }}).limit(7).exec((err,nearby)=>{
                            if(err){
                                return res.json(handleErr(err))
                            }
                            else{
                                
                                links.find({}).sort({created_date:-1}).limit(7).exec((err,newlyadded)=>{
                                    if(err){
                                        return res.json(handleErr(err))
                                    }
                                    else{
                                        //links
                                        // return res.json(handleSuccess(links))
                                        Touristing.find({}).limit(7).exec((err,touristing)=>{
                                            if(err){
                                                return res.json(handleErr(err))
                                            }
                                            else{
                                                return res.json(handleSuccess({category,toprated,nearby,newlyadded,touristing}))
                                
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    else{
        console.log("yellow")
    }
})

module.exports=router