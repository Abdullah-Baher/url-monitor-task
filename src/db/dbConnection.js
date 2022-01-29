const mongoose = require('mongoose');

mongoose.connect(process.env.mongo_URL).then(() => console.log('connected to DB'))
.catch((e) => console.error(e.message));