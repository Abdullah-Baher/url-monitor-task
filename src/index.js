require('dotenv').config();
require('./db/dbConnection');

const express = require('express');
const usersRouter = require('./routers/user');
const checkRouter = require('./routers/check'); 
const { startCronsServerUp } = require('./controllers/check');

const app = express();

const port = process.env.Port || 3000;


app.use(express.json());
app.use(usersRouter);
app.use(checkRouter);


app.listen(port, () => {
    console.log(`server is up on ${port}`);
});

startCronsServerUp();