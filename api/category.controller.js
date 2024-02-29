import ServicesService from "../services/category.service.js"

let servicesServ = new ServicesService()

export default class CustomerController {
    
    constructor() { }

    async getCategories(req, res, next) {
        let services = await servicesServ.getCategories({ limit: Number(req.query.limit ?? 10), offset: Number(req.query.offset ?? 0), search: req.query.search })
        next(services)
    }

    async getSubCategories(req, res, next) {
        let subServices = await servicesServ.getSubCategories({category_id:Number(req.params.id), limit: Number(req.query.limit ?? 10), offset: Number(req.query.offset ?? 0)})
        next(subServices)
    }
}