import handler from '../handlers/index.js'
import config from '../config/index.js'
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import TokenHandler from "../handlers/token.handler.js"

let db = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })
let bucket = new handler.bucketHandler()
let encryption = new handler.encryption()
let commons = new handler.commonsHandler()
let JWT = new handler.JWT()

let tokenHandler = new TokenHandler()

export default class CustomerService {

    constructor() { }


    async createCustomer(customerBody) {
        let servResp = new config.serviceResponse()
        let customer_avatar = new Object()
        try {
            console.debug('createCustomer() started')
            if (customerBody.avatar) {
                var arr = customerBody.avatar.name.split('.')
                    let extentionName = arr[arr.length - 1]
                let avatar_val = {
                    bucket: config.customer_avatar_s3_bucket_name,
                    key: `${customerBody.email}_${customerBody.avatar['name']}.${extentionName}`,
                    body: await bucket.fileToArrayBuffer(customerBody.avatar)
                }
                customer_avatar = await bucket.upload(avatar_val)
            }

            if (customerBody.phone_number != null) {
                let customer = await db.users.findFirst({
                    where: {
                        phone_number: customerBody.phone_number
                    }
                })
                if (customer != null) {
                    servResp.data = null
                    servResp.message = 'User already exist'
                    servResp.isError =  true
                    return servResp
                }
             
            }
           
            await db.users.create({
                data: {
                    phone_number: customerBody.phone_number,
                    first_name: customerBody.first_name,
                    last_name: customerBody.last_name,
                    image: customer_avatar.url ?? "",
                    created_at: new Date(new Date().toUTCString()),
                }
            })

            let newCustomer = await db.users.findFirst({
                where: {
                    phone_number: customerBody.phone_number
                }
            })

            if (!newCustomer) {
                throw new Error('User not found, Incorrect email or password')
            }

            let token = await JWT.getToken(newCustomer)
            servResp.data = {
                ...newCustomer, token: token
            }
            console.debug('createCustomer() returning')

        } catch (error) {
            console.debug('createVendor() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async updateCustomer(req) {
        let servResp = new config.serviceResponse()
        let customer_avatar = new Object()
        let customerBody = req.body
        try {

            let token = await tokenHandler.checkToken(req)
            if (token.isError == true) {
                servResp.isError = true
                servResp.message = 'Token is not valid'
                return servResp
            } 

            
            console.debug('update Customer() started')
            let customer = await db.users.findFirst({ where: { id: token.id } })

            if (!customer) {
                throw new Error('Customer not found!')
            }

            if (customerBody.avatar) {
                if (typeof customerBody.avatar === 'string') {
                    customer_avatar['url'] = customerBody.avatar
                } else {
                    var arr = customerBody.avatar.split('.')
                    let extentionName = arr[arr.length - 1]
                    let avatar_val = {
                        bucket: config.customer_avatar_s3_bucket_name,
                        key: `${customerBody.email}_${customerBody.avatar['name']}.${extentionName}`,
                        body: await bucket.fileToArrayBuffer(customerBody.avatar)
                    }
                    customer_avatar = await bucket.upload(avatar_val)
                }
            }

            // customerBody.password = encryption.encrypt(customerBody.password)
            let updatedCustomer = await db.users.update({
                data: {
                    first_name: customerBody.first_name || undefined,
                    last_name: customerBody.last_name || undefined,
                    image: customer_avatar.url ? customer_avatar.url : undefined,
                    updated_at: new Date(new Date().toUTCString()),
                    phone_number: customerBody.phone_number || undefined,
                },
                where: {
                    id: Number(token.id)
                }
            })
            console.debug('createCustomer() returning')
            servResp.data = updatedCustomer
        } catch (error) {
            console.debug('createCustomer() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async saveCustomerFCMToken(query) {
        let servResp = new config.serviceResponse()
        try {
            let token = await tokenHandler.checkToken(req)
            if (token.isError == true) {
                servResp.isError = true
                servResp.message = 'Token is not valid'
                return servResp
            } 
            console.debug('getVendorData() started')
            let customer = await db.users.update({
                where: {
                    id: Number(token.id)
                },
                data: {
                    fcm_token: query.token
                }
            })

            servResp.data = customer
            console.debug('getVendorData() ended')
        } catch (error) {
            console.debug('createVendor() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getCustomer(req) {
        let servResp = new config.serviceResponse()
        try {
            let token = await tokenHandler.checkToken(req)
            if (token.isError == true) {
                servResp.isError = true
                servResp.message = 'Token is not valid'
                return servResp
            } 
            console.debug('getCustomer() started')
            servResp.data = await db.users.findFirst({ where: { id: Number(token.id) } })
            console.debug('getCustomer() returning')
        } catch (error) {
            console.debug('getCustomer() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async signIn(query) {
        let servResp = new config.serviceResponse()
        try {
            console.debug('customer signIn() started')
            let customer = await db.users.findFirst({
                where: {
                    phone_number: query.phone_number
                }
            })

            if (!customer) {
                throw new Error('User not found, Incorrect email or password')
            }

            let token = await JWT.getToken(customer)
            servResp.data = {
                ...customer, token: token
            }
            console.debug('customer signIn() ended')
        } catch (error) {
            console.debug('customer signIn() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

}