const express = require('express');
const auth = require('../middleware/auth');
const ChecksController = require('../controllers/check');

const router = express.Router();

router.post('/check', auth, ChecksController.postCheck);

router.patch('/check/pause/:checkId', auth, ChecksController.pauseCheckById);

router.patch('/check/resume/:checkId', auth, ChecksController.resumeCheckById);

router.get('/check/:checkId', ChecksController.getCheckById);

router.get('/check', ChecksController.getChecks);

router.get('/check/report/:checkId', auth, ChecksController.getReport);

router.delete('/check/:checkId', auth, ChecksController.deleteCheckById);


module.exports = router;