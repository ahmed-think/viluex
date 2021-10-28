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
    var to = new Date()
var priorDate = new Date().setDate(to.getDate()-30)
var pdate = new Date(priorDate)

// current date
// adjust 0 before single digit date
let date = ("0" + to.getDate()).slice(-2);
let month = ("0" + (to.getMonth() + 1)).slice(-2);

// current year
let year = to.getFullYear();
let today=new Date(`${year}-${month}-${date}`)
// let pd=d-30
console.log(today);
console.log(pdate);
    cat.countDocuments({})
.exec((er,info)=>{
    if(er) res.json(error(er))
    else {
        list.countDocuments({})
        .exec((err,doc)=>{
            if(err) res.json(error(err))
            else {
                list.find({created_date:{$gte:pdate,$lte:today}})
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
    let dates=[]
    let values=[]
    for (let i = 0; i < 30; i++) {
            if(dates.length==0){
            var to = new Date()
            var priorDate = new Date().setDate(to.getDate()-i)
            var pdate = new Date(priorDate)
            let date = ("0" + pdate.getDate()).slice(-2);
     let month = ("0" + (pdate.getMonth() + 1)).slice(-2);
     
     // current year
     let year = to.getFullYear();
     let today=new Date(`${year}-${month}-${date}`)
             dates.push(today)
             list.aggregate( [
                 {$match:{created_date:{$gte:today}}},
                 {
                   $group: {
                      _id: "$created_date",
                      count: { $count: { } }
                   }
                 }
               ] )
               .exec((err,doc)=>{
                if(err) res.json(error(err))
                    doc.forEach(val=>{
                        if(val!==undefined){
                            let numb
                    val.forEach(value=> {
                        numb+=value.count
                    } )
                 values.push(numb)
                        }
                    })
               })
         }
        else {
                var to = new Date()
                var priorDate = new Date().setDate(to.getDate()-i)
                var pdate = new Date(priorDate)
                let date = ("0" + pdate.getDate()).slice(-2);
         let month = ("0" + (pdate.getMonth() + 1)).slice(-2);
         
         // current year
         let year = to.getFullYear();
         let today=new Date(`${year}-${month}-${date}`)
                 dates.push(today)
                 list.aggregate( [
                     {$match:{created_date:{$gte:today,$lte:dates[i-1]}}},
                     {
                       $group: {
                          _id: "$created_date",
                          count: { $count: { } }
                       }
                     }
                   ] )
                   .exec((err,doc)=>{
                       let numb
                       res.send(doc);

                    doc.forEach(val=>{
                        if(val!==undefined){
                            // console.log(val.count);
                    // val.forEach(value=> {
                    //     numb+=value.count
                    // } )
                        numb+=val.count

                 values.push(numb)
                        }
                    })
                   })
             }
    }

    setTimeout(() => {
        res.json(success({dates:dates,value:values}))
    }, 3000);
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

 router.get('/viewallcategories',(req,res)=>{
     cat.find({},(err,doc)=>{
         if(err){
             return res.json(error(err))
         }
         else{
             return res.json(success(doc))
         }
     })
 })

 router.delete('/deletecategory',(req,res)=>{
     cat.findByIdAndDelete(req.body.id,(err,doc)=>{
         if(err){
             return res.json(error(err))
         }
         else{
             return res.json(success(doc))
         }
     })
 })
module.exports=router
