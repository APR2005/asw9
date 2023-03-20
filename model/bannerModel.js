const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    banner:{
        type:String,
        required:true,
    },
    bannerImage:{
        type:Array,
        required:true,
    },
    is_active:{
        type:Boolean,
        default:false,
    }
})

module.exports = mongoose.model('banner',bannerSchema)