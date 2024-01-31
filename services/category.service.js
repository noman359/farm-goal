import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import config from '../config/index.js'

let db = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

export default class ServicesService {

    constructor() { }

    async getCategories(filters = {
        limit: 10, offset: 0, search: "", filter: {}
    }) {
        let servResp = new config.serviceResponse()
        try {
            let [categories, count] = await db.$transaction([db.categories.findMany({
                where: { name: { contains: filters.search } },
                skip: (filters.offset - 1) * filters.limit, // Calculate the number of records to skip based on page number
                take: filters.limit, // Set the number of records to be returned per page
            }), db.services.count({
                where: { name: { contains: filters.search } },
                skip: (filters.offset - 1) * filters.limit,
                take: filters.limit
            })])
            servResp.data = {
                services: categories,
                count: count
            }
        } catch (error) {
            console.debug('createVendor() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getSubCategories(filters = {
        service_id: 0, limit: 10, offset: 0
    }) {
        let servResp = new config.serviceResponse()
        try {
            let [sub_categories, count] = await db.$transaction([db.subcategory.findMany({
                where: {
                    category_id: filters.category_id
                },
                take: filters.limit,
                skip: filters.offset * 10
            }), db.subcategory.count({
                where: {
                    category_id: filters.category_id
                },
                take: filters.limit,
                skip: filters.offset * 10
            })])
            servResp.data = {
                sub_services: sub_categories,
                count: count
            }
        } catch (error) {
            console.debug('createVendor() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

}
