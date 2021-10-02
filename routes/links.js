const express = require('express')
const router = express.Router()
const error = require('../handle function/error')
const success = require('../handle function/handlesucces')
const link = require('../schema/links')
const  crypto = require('crypto');
const  fs = require('fs');
const otpGenerator = require('otp-generator')
const multer = require('multer');
const nodemailer = require('nodemailer');
const otpp = require('../schema/opt');
var upload = multer({ dest: __dirname + '/../../images/' });
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

router.post('/signup', (req, res) => {
  const a = {
    email: req.body.email,
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
        if (err) console.log(error(err))
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
      if (err) res.json({ msg: "failed finding otp", data: err });
      else {
        if (doc.otp == req.body.otp) {
          let data = {
            email: req.body.email,
         pasword: encrypt(req.body.pass)
          }
          link.create(data, (er, dc) => {
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
  if (req.body.email !== null) {
    link.findOne({ email: req.body.email }).exec((err, doc) => {
      if (err) res.json(error(err))
      else {
        if (doc !== null) {
          const a = {
            email: req.body.email,
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
        }
      }
    })
  }
})

//verify after forget
router.post('/verifyforget', (req, res) => {
  otpp.findById(req.body.otpid)
    .exec((err, doc) => {
      if (err) res.json({ msg: "failed finding otp", data: err });
      else {
        if (doc.otp == req.body.otp) {
          link.findOneAndUpdate({ email: req.body.email }, { pasword: encrypt(req.body.pass) }, { new: true })
            .exec((er, dc) => {
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
router.post('/login', (req, res) => {
  link.findOne({ email: req.body.email }, 'email pasword  status', (err, re) => {
    if (err) {
      res.json(error(err));
    } else {
      if (req.body.email !== re.email) {
        res.json("invalid email")
      } else if (req.body.pasword !== decrypt(re.pasword)) {
        res.json("invalid pasword")
      } else {

        link.findByIdAndUpdate(re._id, { isloggedin: "true" }, { new: true }, function (err, doc) {
          if (err) {
            res.json(error(err));
          } else {
            console.log("user found", doc);
            res.json({ msg: "succesfully login", data: doc })
          }
        })
      }
    };
  })
})
router.post('/removepics', (req, res) => {
  link.findByIdAndUpdate(req.body.id, { $pullAll: { Images: req.body.pictures } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else {
        let files = req.body.pictures
        files.forEach(element => {
          if (element !== undefined) {

            return fs.unlink('upload' + '/../../images/' + element, (error) => {
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

router.post('/removecover', (req, res) => {
  link.findByIdAndUpdate(req.body.id, { $unset: { Cover: req.body.cover } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else {
          if (req.body.cover !== undefined) {
             fs.unlink('upload' + '/../../images/' + req.body.cover, (eror) => {
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

router.post('/addpics', upload.array('image'), (req, res) => {
  var files = req.files
  var names = files.map(file => {
    return file.filename
  })
  link.findByIdAndUpdate(req.body.hid, { $push: { Images: { $each: names } } }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else res.json(success(doc))
    })
})
router.post('/addcover', upload.single('image'), (req, res) => {
  link.findByIdAndUpdate(req.body.hid, { Cover:req.file.filename }, { new: true })
    .exec((err, doc) => {
      if (err) res.json(error(err))
      else res.json(success(doc))
    })
})

router.post('/addtitle', (req, res) => {
  link.findByIdAndUpdate(req.body.id, { Title: req.body.title, Category: req.body.catid }, { new: true })
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

router.post('/adddetails', (req, res) => {
  link.findByIdAndUpdate(req.body.id, req.body, { new: true })
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

router.post('/viewsingle', (req, res) => {
  link.findById(req.body.id)
    .exec((err, doc) => {
      if (err) {
        res.json(error(err))
      } else {
        res.json(success(doc))
      }
    })
})

//view busnis by cat
router.post('/viewbycat', (req, res) => {
  link.find({ Category: req.body.catid })
    .exec((err, doc) => {
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
router.post('/addreview', (req, res) => {
  link.findById(req.body.linkid)
    .exec((er, info) => {
      if (er) res.json(error(er))
      else {
        let data = {
          email: req.body.email,
          rating: req.body.rating,
          text: req.body.text
        }
        link.findByIdAndUpdate(info._id, { $push: { reviews: data } }, { new: true })
          .exec((err, doc) => {
            if (err) res.json(error(err));
            else {
              let rate = doc.reviews.map(r => {
                return r.rating
              }).reduce((a, b) => {
                return a + b
              })
              let raating = rate / doc.reviews.length
              link.findByIdAndUpdate(doc._id, { ratings: raating }, { new: true })
                .exec((Er, Doc) => {
                  if (Er) res.json(error(Er))
                  else {
                    res.json(success(doc.reviews));
                  }
                })
            }
          })
      }
    })
})

//view items of single brand with sort or without sort
router.post('/viewlinks', (req, res) => {
  if (req.body.action === "category") {
    link.find({ Category: req.body.action })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "price range") {
    link.find({ Starting_price: { $lte: req.body.upper, $gte: req.body.lower } })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "high-low") {
    link.find()
      .sort({ Starting_price: -1 })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "low-high") {
    link.find()
      .sort({ Starting_price: 1 })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "newest-to-oldest") {
    link.find()
      .sort({ created_date: -1 })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "oldest-to-newest") {
    link.find()
      .sort({ created_date: 1 })
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
  else if (req.body.action === "Distance range") {
    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      let { longitude, latitude } = req.body
      car.find({
        geometry: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude], //longitude and latitude
            },
            $minDistance: 0,
            $maxDistance: 10 * 1000,
          },
        },
      })
        .limit(4)
        .exec((err, docs) => {
          if (err) return res.json(error(err));
          else return res.json(success(docs));
        });
    } else {
      return res.json('Location can not be null')
    }
  }
  else {
    link.find()
      .limit(10)
      .exec((err, doc) => {
        if (err) console.log(err);
        else res.json({ msg: "success", data: doc })
      })
  }
})

module.exports = router