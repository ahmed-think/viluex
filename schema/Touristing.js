const mongoose = require('mongoose')

const GeoSchema = new mongoose.Schema({
    type:
    {
        type: String,
        default: "Point"

    },
    coordinates:
    {
        type: [Number]
    }
})

const WorkingModel = new mongoose.Schema({
    day: { type: String },
    is_opened: { type: Boolean },
    opening_hour: { type: Number, min: 00, max: 23 },
    closing_hour: { type: Number, min: 00, max: 23 },
})

const TouristingModel = new mongoose.Schema({
    progress: { type: String, default: "signup" },
    list_id: { type: String, required: true },
    Category: { type: mongoose.Schema.Types.ObjectId, ref: 'touristingcategory' },
    Title: { type: String },
    Short_description: { type: String },
    Description: { type: String },
    Starting_price: { type: Number },
    Amenities: [{ type: String }],
    working_hours: [WorkingModel],
    Images: [{ type: String }],
    Cover: { type: String },
    City: { type: String },
    geometry: GeoSchema,
    Complete_address: { type: String },
    Contact_Number: { type: Number },
    Tags: [{ type: String }],
    created_date: {
        type: Date,
        default: Date.now()
    },
    status: { type: String, default: "unblock" }
})
TouristingModel.index({ geometry: '2dsphere' });
module.exports = mongoose.model('touristings', TouristingModel)