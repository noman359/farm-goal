import TokenHandler from "../handlers/token.handler.js"
import CustomerService from "../services/customer.service.js"
import config from '../config/index.js'

let customerServ = new CustomerService()
let tokenHandler = new TokenHandler()

export default class CustomerController {

    constructor() { }

    async createCustomer(req, res, next) {
        let created_customer = await customerServ.createCustomer(req.body)
        next(created_customer)
    }

    async updateCustomer(req, res, next) {
        let updated_customer = await customerServ.updateCustomer(req)
        next(updated_customer)
    }

    async getFCMToken(req, res, next) {
        let created_customer_token = await customerServ.saveCustomerFCMToken(req.body)
        next(created_customer_token)
    }

    async getCustomer(req, res, next) {
        let customer = await customerServ.getCustomer(req)
        next(customer)
    }

    async deleteCustomer(req, res, next) {
        let customer = await customerServ.deleteCustomer(req)
        next(customer)
    }

    async login(req, res, next) {
        let customer = await customerServ.login(req.body)
        next(customer)
    }

    async customerLogin(req, res, next) {
        let token = await customerServ.signIn(req.body)
        next(token)
    }

}