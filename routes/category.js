const express=require('express')
const router=express.Router()
const error=require('../handle function/error')
const success=require('../handle function/handlesucces')
const cat=require('../schema/category')
const list=require('../schema/links')
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
// router.post('/viewsingle',(req,res)=>{
//     cat.findById(req.body.id,)
//     .exec((err,doc)=>{
//         if (err) {
//             res.json(error(err))
//         } else {
//             res.json(success(doc))            
//         }
//     })
// })

router.post('/statuschange',(req,res)=>{
    cat.findById(req.body.id)
    .exec((er,info)=>{
        if (er) {
            res.json(error(er))
        } else {
            if(info.status==req.body.status)
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
             {$match:{links:{$ne:[]}}},
             {$match:{status:"unblock"}},
             {$project: { "links": 0,Category:0} } 
        
     ])
    //  .populate('subcat')
     .exec((err,doc)=>{
         if(err) console.log(err);
            else  return res.json({msg:"success",data:doc})
     })
})

router.get('/viewadmin',(req,res)=>{
    cat.find()
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else res.json(success(doc))
    })
})
//total numb of categories and list
router.get('/gettotal',(req,res)=>{
    var today = new Date()
var priorDate = new Date().setDate(today.getDate()-30)
var to = new Date(priorDate)

// current date
// adjust 0 before single digit date
let date = ("0" + today.getDate()).slice(-2);
let month = ("0" + (today.getMonth() + 1)).slice(-2);

// current year
let year = today.getFullYear();
let d=new Date(`${year}-${month}-${date}`)
// let pd=d-30
console.log(to);
console.log(d);
    cat.countDocuments({})
.exec((er,info)=>{
    if(er) res.json(error(er))
    else {
        list.countDocuments({})
        .exec((err,doc)=>{
            if(err) res.json(error(err))
            else {
                list.find({created_date:{$lte:d,$gte:to}})
                .exec((Err,Doc)=>{
                    if(err) res.json(error(Err))
                    else res.json(success({"total numb of categories":info,"total numb of list":doc,"total listinings in last 30 days":Doc}))
                })
            }
        })
    }
})
})
 router.get('/totalperday',(req,res)=>{
    list.aggregate( [
        {
          $group: {
             _id: "$created_date",
             count: { $count: { } }
          }
        }
      ] )
      .exec((err,doc)=>{
          if(err) res.json(error(err))
          else res.json(success(doc))
      })
 })

 router.get('/getcat',(req,res)=>{
    cat.aggregate([
    
        { $lookup:
            {
               from: "links",
               localField: "_id",
               foreignField: "Category",
               as: "links"
           }},
           {
            $project: {
               "name": 1,"pic":1,"status":1,
               numberOflistinings: { $cond: { if: { $isArray: "$links" }, then: { $size: "$links" }, else: "NA"} }
            }
         }
      
   ])
   .sort({numberOflistinings:-1})
   .limit(5)
   .exec((err,doc)=>{
       if(err) console.log(err);
          else  return res.json({msg:"success",data:doc})
   })
 })
module.exports=router
