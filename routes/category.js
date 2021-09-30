const express=require('express')
const router=express.Router()
const error=require('../handle function/error')
const success=require('../handle function/handlesucces')
const cat=require('../schema/category')
const multer = require('multer')
var upload = multer({ dest: __dirname + '/../../uploads/' });

router.post('/addcat',upload.single('image'),(req,res)=>{
    let data={
        name:req.body.name,
        pic:req.file.filename
    }
    cat.create(data,(err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})
//busness
router.post('/viewsingle',(req,res)=>{
    cat.findById(req.body.id,)
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))            
        }
    })
})

router.post('/statuschange',(req,res)=>{
    cat.findById(req.body.id)
    .exec((er,info)=>{
        if (er) {
            res.json(error(er))
        } else {
            if(doc.status==req.body.status)
            {
                res.json(success(`status is alrady ${req.body.status}`))
            }
            else{
                cat.findByIdAndUpdate(req.body.id,{status:req.body.status},{new:true})
                .exec((err,doc)=>{
                    if (err) {
                        res.json(error(err))
                    }
                    else{
                        res.json(success(doc))
                    }
                })

            }
        }
    })
})
router.get('/viewall',(req,res)=>{
    cat.aggregate([
    
          { $lookup:
              {
                 from: "links",
                 localField: "_id",
                 foreignField: "Category",
                 as: "links"
             }},
             {$match:{item:{$ne:[]}}},
             {$match:{status:"unblock"}},
             {$project: { "links": 0,Category:0} } 
        
     ])
    //  .populate('subcat')
     .exec((err,doc)=>{
         if(err) console.log(err);
            else  return res.json({msg:"success",data:doc})
     })
})