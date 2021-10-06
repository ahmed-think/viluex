const mongoose = require('mongoose')
const ReviewModel = new mongoose.Schema({
    email: { type: String },
    rating: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    }
})
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

const LinkModel = new mongoose.Schema({
    progress: { type: String, default: "signup" },
    list_id: { type: String, required: true },
    email: { type: String, unique: true },
    Category: { type: mongoose.Schema.Types.ObjectId, ref: 'catagories' },
    Title: { type: String },
    Short_description: { type: String },
    pasword: { type: String },
    Description: { type: String },
    Starting_price: { type: Number },
    Amenities: [{ type: String }],
    working_hours: [WorkingModel],
    Images: [{ type: String }],
    Cover: { type: String },
    City: { type: String },
    isloggedin: { type: Boolean, default: true },
    geometry: GeoSchema,
    Complete_address: { type: String },
    Contact_Number: { type: Number },
    Tags: [{ type: String }],
    ratings: { type: Number, default: 0 },
    created_date: {
        type: Date,
        default: Date.now()
    },
    reviews: [ReviewModel],
    hits: {
        type: Number,
        min: 0,
        default: 0
    },
    status: { type: String, default: "unblock" }
})
LinkModel.index({ geometry: '2dsphere' });
module.exports = mongoose.model('links', LinkModel)