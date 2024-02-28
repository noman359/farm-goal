import handler from '../handlers/index.js';
import { Router } from 'express';
import CustomerController from '../api/customer.controller.js';
import formData from '../middlewares/formdata-parser.js';

const customerCtrl = new CustomerController()
const lRoute = Router();
export default function (router) {
    router.use('/customer', lRoute)
    // lRoute.post('/token', customerCtrl.getFCMToken, handler.apiResponseHandler)
     lRoute.post('/', formData, customerCtrl.createCustomer, handler.apiResponseHandler)
    // lRoute.post('/login', customerCtrl.customerLogin, handler.apiResponseHandler)
     lRoute.get('/', customerCtrl.getCustomer, handler.apiResponseHandler)
     lRoute.post('/login', customerCtrl.login, handler.apiResponseHandler)
     lRoute.put('/', formData, customerCtrl.updateCustomer, handler.apiResponseHandler)
}