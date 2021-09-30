const express=require('express')
const router=express.Router()
const error=require('../handle function/error')
const success=require('../handle function/handlesucces')
const report=require('../schema/report')

router.post('/addreport',(req,res)=>{
    let data={
        reason:req.body.reason,
comments:req.body.comments,
email:req.body.email,
linkid:req.body.linkid
    }
    report.create(data,(err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})

router.post('/viewsingle',(req,res)=>{
    report.findById(req.body.id)
    .populate('linkid')
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})


router.post('/viewall',(req,res)=>{
    report.find()
    .populate('linkid')
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})
module.exports=router