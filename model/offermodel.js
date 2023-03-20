const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref:'user'
    }],
    maxAmount :{
         type: Number,
         required :true,
    },
    minAmount :{
        type: Number,
        required :true,
   },
     expiryDate :{
        type: Date,
        required :true
    }
},{timestamps:true})

module.exports = mongoose.model('offer',offerSchema)