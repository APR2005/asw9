const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:{
        type: String,
        require:true,
        unique:true,
        uppercase : true
    }
})


module.exports = mongoose.model('Category',categorySchema)