const scheduler = require('node-schedule');
const Check = require('../models/check');
const User = require('../models/user');
const axios = require('axios').default;
const {sendCheckUpEmail, sendCheckDownEmail} = require('../emails/account');

axios.interceptors.request.use(x => {
    x.meta = x.meta || {};
    x.meta.requestStartedAt = new Date().getTime();
    return x;
});

axios.interceptors.response.use(x => {
    x.responseTime = new Date().getTime() - x.config.meta.requestStartedAt;
     return x;
});


const callWebHook = async (webhookUrl, status) => {
    try {
        await axios.post(webhookUrl,{
            status: status
        });
    } catch (e) {
        console.error(e);
    }
}

const startCron = async (check, email, name) => {
    try {
        //try cron with template string
        scheduler.scheduleJob(check.name, `*/${check.interval} * * * *`, async () => {
            try {
                const response = await axios.get(check.protocol + check.url + check.port + check.path, {
                    timeout: (check.timeout * 1000) 
                });
    
                //add success request to upRequests
                check.numberOfUpRequests = check.numberOfUpRequests + 1; 
                // update current status as up
                check.currentUrlStatus = 'Up';
                //add response time to array
                check.responseTime.push(response.responseTime);
                //send check up email
                //sendCheckUpEmail(email, name, check.protocol + check.url + port + path);

            } catch (e) {
                // add failed request to downRequests
                check.numberOfDownRequests = check.numberOfDownRequests +  1;
                // update current status as down
                check.currentUrlStatus = 'Down';
                //send check down email
                //sendCheckDownEmail(email, name, check.protocol + check.url + port + path);

            } finally {
                // add time for request in history
                check.requestsHistory.push(new Date().toString());

                if(check.webhook.length > 0){
                    if(check.currentUrlStatus === 'Down' && (check.numberOfDownRequests % check.thresholdNumber === 0)){
                        // send post request to webhook api (webhookUrl, Down)
                        await callWebHook(check.webhook, check.currentUrlStatus);
                    }

                    else if(check.currentUrlStatus === 'Up' && (check.numberOfUpRequests % check.thresholdNumber === 0)){
                        // send post request to webhook api (webhookUrl, Up)
                        await callWebHook(check.webhook, check.currentUrlStatus);
                    }
                }

                await check.save();
            }
            
        });
    } catch (e) {
        console.error(e);  
    } 
}

const postCheck = async (req, res) => {
    try {

        const check = new Check({
            ...req.body,
            owner: req.user._id,
            responseTime: [],
            requestsHistory: []
        });
        
        await check.save();

        await startCron(check, req.user.email, req.user.username);

        res.status(201).send(check);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}


const pauseCheckById = async (req, res) => {
    try {
        const check = await Check.findOne({ _id: req.params.checkId, owner: req.user._id });

        if(!check){
            return res.status(400).send({message: 'Could not find a check from the provided data'});
        }

        if(check.currentCheckStatus === false){
            return res.send(check);
        }

        const job = scheduler.scheduledJobs[check.name];

        job.cancel();
        check.currentCheckStatus = false;

        await check.save();
        res.send(check);
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
}

const resumeCheckById = async (req, res) => {
    try {
        const check = await Check.findOne({ _id: req.params.checkId, owner: req.user._id });

        if(!check){
            return res.status(400).send({message: 'Could not find a check from the provided data'});
        }

        if(check.currentCheckStatus === true){
            return res.send(check);
        }

        check.currentCheckStatus = true;
        await check.save();
        await startCron(check, req.user.email, req.user.username);

        res.send(check);
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
}

const deleteCheckById = async (req, res) => {
    try {
        const check = await Check.findOneAndDelete({ _id: req.params.checkId, owner: req.user._id });

        if(!check){
            return res.status(400).send({message: 'Could not find a check from the provided data'});
        }

        if(check.currentCheckStatus === true){
            const job = scheduler.scheduledJobs[check.name];
            job.cancel();
        }

        res.send(check);

    } catch (e){
        res.status(400).send({ message: e.message });
    }
}

const getCheckById = async (req, res) => {
    try {
        const checkId = req.params.checkId;
        const check = await Check.findById(checkId);

        if(!check){
            return res.status(400).send({message: 'Invalid checkId'});
        }

        res.send(check);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const getChecks = async (req, res) => {
    try {
        if(req.query.userId){
            const user = await User.findById(req.query.userId);

            if(!user){
                return res.status(400).send({ message: 'Invalid userId' });
            }

            await user.populate('checks');
            const checks = user.checks;
            res.send(checks);
        } else {
            const checks = await Check.find();
            res.send(checks);
        }

    } catch (e){
        res.status(500).send({ message: e.message });
    } 
}

const getReport = async (req, res) => {
    try {
        const check = await Check.findOne({ _id: req.params.checkId, owner: req.user._id });

        if(!check){
            return res.status(400).send({ message: 'Could not find a check from the provided data' });
        }

        const report = {
            status: check.currentUrlStatus,
            availability: ((check.numberOfUpRequests / (check.numberOfUpRequests + check.numberOfDownRequests)) * 100),
            outages: check.numberOfDownRequests,
            //check.interval is in minutes from 0 to 59
            downtime: ((check.numberOfDownRequests * check.interval) * 60),
            uptime: ((check.numberOfUpRequests * check.interval) * 60),
            responseTime: check.responseTime.reduce((a, b) => a + b) / check.responseTime.length,
            history: check.requestsHistory
        }

        res.send(report);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const startCronsServerUp = async () => {
    try {
        const checks = await Check.find({ currentCheckStatus: true });

        for await(const check of checks) {
            if(check.currentCheckStatus){
                const user = await User.findById(check.owner);
                await startCron(check, user.email, user.username);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}

module.exports = {
    postCheck,
    pauseCheckById,
    resumeCheckById,
    deleteCheckById,
    getCheckById,
    getChecks,
    getReport,
    startCronsServerUp
}