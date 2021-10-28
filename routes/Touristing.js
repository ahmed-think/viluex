const express = require('express')
const router = express.Router()
const error = require('../handle function/error')
const success = require('../handle function/handlesucces')
const Touristing = require('../schema/Touristing')
const cat = require('../schema/category')
const fs = require('fs');
const uuid = require('uuid');
const multer = require('multer');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
var upload = multer({ dest: __dirname + '/../../images/' });


//remove pics

router.post('/removepics', (req, res) => {
  Touristing.findByIdAndUpdate(req.body.id, { $pullAll: { Images: req.body.pictures } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else {
        let files = req.body.pictures
        files.forEach(element => {
          if (element !== undefined) {

            return fs.unTouristing('upload' + '/../../images/' + element, (error) => {
              if (error) {
                console.log('error->', error)
              }
              return {
                message: "Success"
              }
            })
          }
          else {
            return {
              message: "Failed",
              error: "File can not be null"
            }
          }
        });
        res.json(success(doc))
      }
    })
})

//remove cover photo

router.post('/removecover', (req, res) => {
  Touristing.findByIdAndUpdate(req.body.id, { $unset: { Cover: req.body.cover } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else {
        if (req.body.cover !== undefined) {
          fs.unTouristing('upload' + '/../../images/' + req.body.cover, (eror) => {
            if (error) {
              res.json(error(eror))
            }
          })
          res.json(success(doc))
        }
        else {
          res.json(error("File can not be null"))
        }
      }
    })
})

//add pics to touristing

router.post('/addpics', upload.array('image'), (req, res) => {
  var files = req.files
  var names = files.map(file => {
    return file.filename
  })
  Touristing.findByIdAndUpdate(req.body.hid, { $push: { Images: { $each: names } } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else res.json(success(doc))
    })
})

//add cover photo

router.post('/addcover', upload.single('image'), (req, res) => {
  Touristing.findByIdAndUpdate(req.body.hid, { Cover: req.file.filename }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else res.json(success(doc))
    })
})

//add title and categoryid through id

router.post('/addtitle', (req, res) => {
  Touristing.findByIdAndUpdate(req.body.id, { Title: req.body.title, Category: req.body.catid }, { new: true })
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//add details through touristing id

router.post('/adddetails', (req, res) => {
 
  Touristing.findByIdAndUpdate(req.body.id, req.body, { new: true })
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//view single touristing

router.post('/viewsingle', (req, res) => {
  Touristing.findById(req.body.id)
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//view touristing by categoryid

router.post('/viewbycat', (req, res) => {
  Touristing.find({ Category: req.body.catid})
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//filter according to longitude latitude

router.post('/filter', (req, res) => {
  let { longitude, latitude } = req.body
  let  day
  var today = new Date();
var time = today.getHours()
  switch (new Date().getDay()) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day= "tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
  }
  if(req.body.status=="open"){
    console.log(day);
    console.log(time);
    Touristing.find({
      Category: new ObjectId(req.body.catid), 
      Starting_price: { $lte: req.body.higher, $gte: 0 },
      geometry: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], //longitude and latitude
          },
          $minDistance: 0,
          $maxDistance: req.body.dis * 1000,
        },
      },
      // "$working_hours.day":day,
      // working_hours:{"$.opening_hour":{$lte:time,},"$.closing_hour":{gt:time}}
      working_hours: {$elemMatch: {day:day, opening_hour:{$lte:time}, closing_hour:{$gte:time}}}
    })
    .sort({ Starting_price: req.body.sort })
    .sort({created_date: req.body.date})
      .exec((err, doc) => {
        if (err) console.log(err);
        else {
          let addrs=doc.map(element=>{
            return{
              name:element.Title,
              longitude:element.geometry.coordinates[0],
              latitude:element.geometry.coordinates[1]
            }
          })
          console.log(doc);
          res.json(success({addrs,doc}))
        }
      })
  }else{
    Touristing.find({
      Category: new ObjectId(req.body.catid), 
      Starting_price: { $lte: req.body.higher, $gte: 0 },
      geometry: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], //longitude and latitude
          },
          $minDistance: 0,
          $maxDistance: 10 * 1000,
        },
      }
    })
    .sort({ Starting_price: req.body.sort })
    .sort({created_date: req.body.date})
      .exec((err, doc) => {
        if (err) console.log(err);
        else {
          let addrs=doc.map(element=>{
            return{
              name:element.Title,
              longitude:element.geometry.coordinates[0],
              latitude:element.geometry.coordinates[1]
            }
          })
          console.log(doc);
          res.json(success({addrs,doc}))
        }
      }) 
  }
})

//change status of touristing

router.post('/statuschange',(req,res)=>{
  Touristing.findById(req.body.id)
  .exec((er,info)=>{
      if (er) {
          res.json(error(er))
      } else {
          if(info.status==req.body.status)
          {
              res.json(success(`status is alrady ${req.body.status}`))
          }
          else{
              Touristing.findByIdAndUpdate(req.body.id,{status:req.body.status},{new:true})
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

//update touristing

router.post('/update', (req, res) => {
  Touristing.findByIdAndUpdate(req.body.id, req.body, { new: true })
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//search touristing through regex

router.post('/search',(req,res)=>{
  Touristing.find({ Title: { $regex: req.body.text, $options: 'i' }})
  .limit(10)
  .exec((err,doc)=>{
    if(err) res.json(error(err))
    else {
      let addrs=doc.map(element=>{
        return{
          name:element.Title,
          longitude:element.geometry.coordinates[0],
          latitude:element.geometry.coordinates[1]
        }
      })
      res.json(success({addrs,doc}))
    }
  })
})

//search location

router.post('/searchloc',(req,res)=>{
  if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
          let { longitude, latitude } = req.body
          
          Touristing.find({
            geometry: {
              $nearSphere: {
                $geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude], //longitude and latitude
                },
                $minDistance: 0,
                $maxDistance: 25 * 1000,
              },
            }})
            .limit(8)
            .exec((err, docs) => {
              if (err) return res.json(error(err));
              else return res.json(success(docs));
            });
        } else {
          return res.json(error('Location can not be null'))
        }
})

let bulk=require('../MOCK_DATA.json')
const handleErr = require('../handle function/error')

//BULK ROUTE
router.get('/adcat',(req,res)=>{
cat.find()
.exec((err,doc)=>{
  for (let i = 880; i <1000; i++) {
    let data=bulk[i]
    data.list_id=uuid.v4()
    data.working_hours= [
      {
          "day": "Monday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Tuesday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Wednesday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Thursday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Friday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Saturday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      },
      {
          "day": "Sunday",
          "is_opened": true,
          "opening_hour": 11,
          "closing_hour": 23
      }
  ]
  data.Category=doc[6]._id
  data.Starting_price=Math.floor(Math.random() * 1000) + 1
  Touristing.create(data,(er,dc)=>{
    if(er) res.json(error(er))
  else console.log("do");
  })
  }

})
setTimeout(() => {
  res.json(success("done"))
}, 10000);
})


router.get('/ad',(req,res)=>{
  Touristing.find()
  .exec((er,dc)=>{
    if(er) res.json(error(er))
    else {
      dc.forEach(element => {
        element.geometry={coordinates:[Math.random() * 17,Math.random() * 17]}
      });
    }
  })
  setTimeout(() => {
    res.json(success("done"))
  }, 20000);
})



//view all Touristings
router.get('/viewtouristings',(req,res)=>{
  Touristing.find({},(err,doc)=>{
      if(err){
          return res.json(error(err))
      }
      else{
          return res.json(success(doc))
      }
  })
})


module.exports = router