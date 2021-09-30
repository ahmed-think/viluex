const express=require('express')
const router=express.Router()
const error=require('../handle function/error')
const success=require('../handle function/handlesucces')
const link=require('../schema/links')
const otpGenerator = require('otp-generator')
const multer = require('multer');
const nodemailer = require('nodemailer');
const otpp = require('../schema/otp');
var upload = multer({ dest:__dirname + '/../../images/' });
const encrypt = function (pass) {
    var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(`${pass}`, 'utf8', 'hex')
    return mystr += mykey.final('hex');
    ;
  }
  const decrypt = (pass) => {
    var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(`${pass}`, 'hex', 'utf8')
    return mystr += mykey.final('utf8');
  }
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rashid.sj91@gmail.com',
      pass: 'shahidjamal'
    }
  });
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false })

router.post('/adduser', (req, res) => {
  const a = {
    email:req.body.email,
    otp: otp
  }
  var mailOptions = {
    from: 'rashid.sj91@gmail.com',
    to: `${req.body.email}`,
    subject: 'jsoning Email using Node.js',
    text: `${otp}`
  };
  transporter.sendMail(mailOptions, function (eror, info) {
    if (eror) {
      res.json(error(eror));
    } else {
      otpp.create(a, (err, doc) => {
        if (err) res.json(error(err));
        else {
              res.json(success(doc))
        }
      })
    }
  });

})
router.post('/verify', (req, res) => {
    otpp.findById(req.body.otpid)
    .exec((err, doc) => {
        if (err) res.json({msg:"failed finding otp",data:err});
        else {
            if (doc.otp == req.body.otp) {
                let data={
                    email:req.body.email,
                    pasword:encrypt(req.body.pass)
                }
                link.create(data,(er,dc)=>{
                    if (er) {
                        res.json(error(er))
                    } else {
                        res.json(success(dc))
                    }
                })
            }
        }
    })
})
router.post('/forgetpasword', (req, res) => {
    const pass = encrypt(req.body.pasword)
    if (req.body.email !== null) {
      link.findOneAndUpdate({ email: req.body.email }, { pasword: pass }, { new: true }).exec((err, doc) => {
        if (err) console.log(err)
        else res.json({ msg: "done", data: doc })
      })
    }
  })

  router.post('/login', (req, res) => {
    link.findOne({ email: req.body.email }, 'email pasword  status', (err, re)=> {
     if (err) {
       res.json(error(err));
     } else {
         if (req.body.email !== re.email) {
             res.json("invalid email")
           } else if (req.body.pasword !== decrypt(re.pasword)) {
             res.json("invalid pasword")
           } else {
       
             link.findByIdAndUpdate(re._id, { isloggedin: "true" },{new:true}, function (err, doc) {
               if (err) {
                 res.json(error(err));
               } else {
                 console.log("user found",doc);
             res.json({msg:"succesfully login",data:doc})
               }
             })
           }
         };
     })
})
router.post('/removepics', (req, res) => {
    link.findByIdAndUpdate(req.body.id, { $pullAll: { pic: req.body.pictures } }, { new: true })
        .exec((err, doc) => {
            if (err) res.json(error(err))
            else {
            let files=req.body.pictures
            files.forEach(element => {
                if(element !==undefined){
    
                    return fs.unlink('upload' + '/../../images/'+ element,(error)=>{
                       if(error){
                           console.log('error->',error)
                       }
                       return{
                           message:"Success"
                       }
                   })
               } 
            else{
               return{
                   message:"Failed",
                   error:"File can not be null"
               }
            }
            }); 
                res.json(success(doc))
            }
        })
})

router.post('/addpics', upload.array('image'), (req, res) => {
    var files = req.files
    var names = files.map(file => {
        return file.filename
    })
    link.findByIdAndUpdate(req.body.hid, { $push: { pic: { $each: names } } }, { new: true })
        .populate('city', 'name')
        .exec((err, doc) => {
            if (err) res.json(error(err))
            else res.json(success(doc))
        })
})

router.post('/addtitle',(req,res)=>{
link.findByIdAndUpdate(req.body.id,{Title:req.body.title,Category:req.body.catid},{new:true})
.exec((err,doc)=>{
    if (err) {
        res.json(error(err))
    } else {
        res.json(success(doc))
    }
})
})

router.post('/adddetails',(req,res)=>{
    link.findByIdAndUpdate(req.body.id,req.body,{new:true})
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})

router.post('/viewsingle',(req,res)=>{
    link.findById(req.body.id)
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})

//view busnis by cat
router.post('/viewbycat',(req,res)=>{
    link.find({Category:req.body.catid})
    .exec((err,doc)=>{
        if (err) {
            res.json(error(err))
        } else {
            res.json(success(doc))
        }
    })
})


router.post('/seereviews', (req, res) => {
    link.findById(req.body.id)
        .exec((err, doc) => {
            if (err) res.json(error(err))
            else res.json(success(doc.reviews))
        })
})
router.post('/addreview',(req,res)=>{
    link.findByIdAndUpdate(req.body.linkid,{status:"rewieved"},{new:true})
    .exec((er,info)=>{
      if(er) res.json(error(er))
      else{
        let data={
          email:req.body.email,
          rating:req.body.rating,
          text:req.body.text
        }
        link.findByIdAndUpdate(info._id,{$push:{reviews:data}},{new:true})
        .exec((err,doc)=>{
          if(err) res.json(error(err));
          else {
            let rate=doc.reviews.map(r=>{
              return r.rating
            }).reduce((a,b)=>{
              return a+b
            })
            let raating=rate/doc.reviews.length
            link.findByIdAndUpdate(doc._id,{ratings:raating},{new:true}) 
            .exec((Er,Doc)=>{
              if(Er) res.json(error(Er))
              else{
                res.json(success(doc.reviews));
              }
            })
          }
        })
      }
    })
  })