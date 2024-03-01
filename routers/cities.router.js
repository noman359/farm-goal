import handler from '../handlers/index.js';
import { Router } from 'express';
import CitiesController from '../api/cities.controller.js';

const citiesController = new CitiesController()
const lRoute = Router();
export default function (router) {
    router.use('/cities', lRoute)
    lRoute.get('/', citiesController.getCities, handler.apiResponseHandler)
}