const Router = require('express').Router();
const {droneDispatcher} = require('../Controllers/main');

Router.post('/dispatch',droneDispatcher);

module.exports = Router;