const express = require('express');

const { InfoController } = require('../../controllers');
const userRoutes = require('./User-routes');

const router = express.Router();

router.get('/info', InfoController.info);

router.use('/user', userRoutes);

module.exports = router;