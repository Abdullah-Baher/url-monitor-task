const mongoose = require('mongoose');
const validator = require('validator').default;

const checkSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    // "https://" or "http://" (don't forget to add :// after your protocol as the example is given)
    protocol: {
        type: String,
        trim: true,
        required: true
    },
    // "jsonplaceholder.typicode.com"
    url: {
        type: String,
        trim: true,
        required: true
    },
    // true if check is working every interval (in minutes), false if check is currently paused
    currentCheckStatus: {
        type: Boolean,
        default: true
    },
    // number of seconds for request timeout
    timeout: {
        type: Number,
        default: 5
    },
    // number of minutes between every check and the next one
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
    // "/posts" or "/users" (don't forget the / before specifing the path as the given example)
    path: {
        type: String,
        trim: true,
        default: ''
    },
    // ":3000" (don't forget the : before specifing the port as the given example)
    port: {
        type: String,
        trim: true,
        default: ''
    },
    // a full url given which listen for post requests to make notifications (fullurl => protocol + url + port + path)
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
    // current status of the url if it is up and working or not
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