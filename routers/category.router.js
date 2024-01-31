import handler from '../handlers/index.js';
import { Router } from 'express';
import ServiceController from '../api/category.controller.js';
import filtersParser from '../middlewares/filters-parser.js';

const serviceCtrl = new ServiceController()
const lRoute = Router();
export default function (router) {
    router.use('/categories', lRoute)
    lRoute.get('/', filtersParser, serviceCtrl.getCategories, handler.apiResponseHandler)
    lRoute.get('/:id/subcategories', serviceCtrl.getSubCategories, handler.apiResponseHandler)
}