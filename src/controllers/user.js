const User = require('../models/user');
const {sendWelcomeEmail, sendWhyCancelEmail} = require('../emails/account');

const postUser = async (req, res) => {
    try {

        const user = new User(req.body);
        await user.save();
       // sendWelcomeEmail(user.email, user.username);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });

    } catch(e) {
        res.status(400).send({ message: e.message });
    }
}

const loginUser = async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
}


const updateUser = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const validUpdates = ['email', 'username', 'password'];

        const isValidUpdate = updates.every(update => validUpdates.includes(update));
        
        if(!isValidUpdate) {
            return res.status(400).send({ message: 'Invalid updates' })
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.send(req.user);

    } catch (e) {
        res.status(400).send({ message: e.message });
    }

}


const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if(!user) {
            //throw new Error('please provide a correct user id');
            return res.status(400).send({ message: 'Invalid userId' });
        }

        res.send(user)
    } catch (e) {
        res.status(400).send({ message: e.message })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
}

const deleteUser = async (req, res) => {
    try {

        await req.user.remove(); // add pre remove user
        //sendWhyCancelEmail(req.user.email, req.user.username);
        res.send(req.user);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const searchUsers = async (req, res) => {
    try {
        const partOfName = req.query.name || '';
        const users = await User.find({ username: { $regex: partOfName.toString(), $options: 'i' } }).limit(10);
        res.send(users);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

module.exports = {
    postUser,
    loginUser,
    updateUser,
    getUser,
    getAllUsers,
    deleteUser,
    searchUsers
}