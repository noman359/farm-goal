import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import config from '../config/index.js'
let db = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

export default class CitiesService {

    constructor() { }

    async getCities(filters) {
        let servResp = new config.serviceResponse()

        var citiesList = []
        var count = 0

        try {

            if (filters.search) {
                citiesList = await db.cities.findMany({
                    where: { name: { contains: filters.search ?? '' } },
                    skip: (filters.offset - 1) * filters.limit, 
                    take: filters.limit
                })

            } else {
                citiesList = await db.cities.findMany({
                    skip: (filters.offset - 1) * filters.limit,
                    take: filters.limit
                })
            }

            servResp.data = citiesList

        } catch (error) {
            console.debug('getCategories() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

}
