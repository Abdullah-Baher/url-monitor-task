const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Check = require('./check');
const validator = require('validator').default;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    
    password: {
        type: String,
        required: true,
        trim: true,
        min: 8
    }
},{
    timestamps: true
});

userSchema.virtual('checks', {
    ref: 'Check',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.generateAuthToken = async function() {
    const user = this;

    const token = await jwt.sign({ _id: user._id.toString() }, process.env.ACCESS_Token_Secret);

    return token;

}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) {
        throw new Error('please provide a correct email');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('please provide a correct password');
    }

    return user;
}

userSchema.pre('save', async function (next) {
    const user = this

    if(!validator.isEmail(user.email)){
        throw new Error('please provide an email');
    }

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Check.deleteMany({ owner: user._id });
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;