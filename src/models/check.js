const mongoose = require('mongoose');
const validator = require('validator').default;

const checkSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    protocol: {
        type: String,
        trim: true,
        required: true
    },
    
    url: {
        type: String,
        trim: true,
        required: true
    },

    currentCheckStatus: {
        type: Boolean,
        default: true
    },

    timeout: {
        type: Number,
        default: 5
    },

    interval: {
        type: Number,
        default: 10,
        min: 0,
        max: 59
    },

    thresholdNumber: {
        type: Number,
        default: 1
    },

    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    path: {
        type: String,
        trim: true,
        default: ''
    },

    port: {
        type: String,
        trim: true,
        default: ''
    },

    webhook: {
        type: String,
        trim: true,
        default: ''
    },

    numberOfUpRequests: {
        type: Number,
        default: 0
    },

    numberOfDownRequests: {
        type: Number,
        default: 0
    },

    currentUrlStatus: {
        type: String,
        default: 'Up',
        trim: true
    },

    responseTime: [ { type: Number, required: true } ],

    requestsHistory: [ { type: String, required: true } ]

}, {
    timestamps: true
});

checkSchema.pre('save' , async function(next) {
    const check = this;

    if(!validator.isURL(check.protocol + check.url + check.port + check.path)){
        throw new Error('please provide a correct url');
    }

    if(check.webhook.length > 0 && !validator.isURL(check.webhook)){
        throw new Error('please provide a correct url for the notifications webhook');
    }

    next();
});

const Check = mongoose.model('Check', checkSchema);

module.exports = Check;