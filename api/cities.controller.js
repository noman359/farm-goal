import CitiesService from "../services/cities.service.js"

let citiesService = new CitiesService()

export default class CitiesController {
    
    constructor() { }

    async getCities(req, res, next) {
        let cities = await citiesService.getCities({ limit: Number(req.query.limit ?? 10), offset: Number(req.query.offset ?? 0), search: req.query.search })
        next(cities)
    }
}