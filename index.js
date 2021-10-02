const express = require('express');
const app = express();
const mongoose = require('mongoose')

const mongoDB = 'mongodb://localhost/viluex';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('open', () => {
    console.log('database connected')
})
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/link',require('./routes/links'))
app.use('/category',require('./routes/category'))
app.use('/report',require('./routes/reqports'))
const link=require('./schema/links')
const cat=require('./schema/category')
app.get('/home',(req,res)=>{
    link.find()
    .sort({ratings:-1})
    .limit(3)
    .exec((er,tr)=>{
        if(err) res.json(error(er))
        else{
            cat.find()
            .exec((Er,info)=>{
                if(Er) res.json(error(Er))
                else{
                    link.find()
                    .sort({created_date:-1})
                    .limit(3)
                    .exec((Err,Doc)=>{
                        if(Err) res.json(error(Err))
                        else{
                             link.find({
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
                          .exec((err,doc)=>{
                              if(err) res.json(error(err))
                              else res.jsonp(success({toprated:tr,categories:info,newly_added:Doc,nearby:doc}))
                          })
                        }
                    })
                }
            })
        }
    })
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => { console.log(`Server started at port ${PORT}`) })


