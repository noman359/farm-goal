import handler from '../handlers/index.js'
import config from '../config/index.js'
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import admin from 'firebase-admin';
import serviceAccount from '../urbancabsvender-firebase-adminsdk-70gg2-1c61b6ef2c.json' assert { type: "json" };
import { parse, format } from 'date-fns';
import TokenHandler from "../handlers/token.handler.js"

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // other configurations...
});
let db = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })
let bucket = new handler.bucketHandler()
let encryption = new handler.encryption()
let commons = new handler.commonsHandler()
let JWT = new handler.JWT()

let tokenHandler = new TokenHandler()


export default class PostService {

    constructor() { }

    async createPost(req) {
        let servResp = new config.serviceResponse()
        var images = []
        let post = req.body
        console.log(post)
        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            const currentDateTime = new Date();
            console.debug('createCustomer() started')
            if (post.images) {
                for (var image of post.images) {
                    let post_image = new Object()
                    var arr = image.name.split('.')
                    let extentionName = arr[arr.length - 1]

                    let avatar_val = {
                        bucket: config.jobs_s3_bucket_name,
                        key: `${currentDateTime.toISOString()}.${extentionName}`,
                        body: await bucket.fileToArrayBuffer(image)
                    }
                    post_image = await bucket.upload(avatar_val)
                    images.push(post_image.url)
                }
            }
            

            servResp.data = await db.posts.create({

                data: {
                    title: post.title,
                    description: post.description,
                    images: postImages != '' ? postImages : undefined,
                    price: Number(post.price),
                    address: post.address,
                    lat: Number(post.lat),
                    long: Number(post.long),
                    quantity: Number(post.quantity),
                    breed: post.breed,
                    age: Number(post.age),
                    status: 'active',
                    category_id: post.category_id,
                    sub_category_id: post.sub_category_id,
                    created_at: new Date(new Date().toUTCString())
                }

            })

            console.debug('createPost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getPostDetails(req) {
        let servResp = new config.serviceResponse()
        let id = req.params.id

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.posts.findFirst({
                where: { id: Number(id) },
                include: { categories: true, subcategory: true }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async updatePost(req) {
        let servResp = new config.serviceResponse()
        var images = []
        let id = req.params.id

        let post = req.body
        console.log(post)

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            const currentDateTime = new Date();
            console.debug('updating post() started')
            if (post.images) {
                for (var image of post.images) {
                    let post_image = new Object()
                    var arr = image.name.split('.')
                    let extentionName = arr[arr.length - 1]

                    let avatar_val = {
                        bucket: config.jobs_s3_bucket_name,
                        key: `${currentDateTime.toISOString()}.${extentionName}`,
                        body: await bucket.fileToArrayBuffer(image)
                    }
                    post_image = await bucket.upload(avatar_val)
                    images.push(post_image.url)
                }
            }

            let existingData = await db.posts.findFirst({
                where: {
                    id: Number(id)
                }
            })

            var postImages = images.join(',')
            if (postImages != '') {
                existingData.images = `${existingData.images},${postImages}`
            }

            servResp.data = await db.posts.update({

                data: {
                    title: post.title ?? existingData.title,
                    description: post.description ?? existingData.description,
                    images: (postImages != '') ? postImages : existingData.images,
                    price: Number(post.price ?? existingData.price),
                    address: post.location ?? existingData.location,
                    lat: Number(post.lat ?? existingData.lat),
                    long: Number(post.long ?? existingData.long),
                    quantity: Number(post.quantity ?? post.quantity),
                    breed: post.breed ?? existingData.post,
                    age: Number(post.age ?? existingData.age),
                    status: 'active',
                    created_at: new Date(new Date().toUTCString()),
                    featured: Number(post.featured ?? existingData.featured),
                },

                where: {
                    id: Number(id)
                }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async incrementPostViews(req) {
        let servResp = new config.serviceResponse()
        let id = req.params.id

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.posts.update({
                where: { id: Number(id) },
                data: {
                    views: {
                        increment: 1
                    },
                    updated_at: new Date(new Date().toUTCString())
                }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async changePostStatus(req) {
        let servResp = new config.serviceResponse()
        let id = req.params.id
        let status = req.body.status
        
        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.posts.update({
                where: { id: Number(id) },
                data: {
                    status: status,
                    updated_at: new Date(new Date().toUTCString())
                }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async changeFeaturedStatus(req) {
        let servResp = new config.serviceResponse()
        let featured = req.body.featured
        let id = req.params.id

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.posts.update({
                where: { id: Number(id) },
                data: {
                    featured: featured,
                    updated_at: new Date(new Date().toUTCString())
                }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getPosts(req) {
        let servResp = new config.serviceResponse()
        var mainListWithFavorites = []
        let data = req.query
        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            if (data.category_id != null) {
                let favoriteList = await db.favorite.findMany({
                    where: { user_id: Number(token.id) },
                })

                let mainList = await db.posts.findMany({
                    where: {
                        category_id: Number(data.category_id)
                    },
                    skip: (Number(data.offset) - 1) * Number(data.limit), // Calculate the number of records to skip based on page number
                    take: Number(data.limit), // Set the number of records to be returned per page
                })

                // Create a mapping of itemId to favorited status
                const favoritedMap = favoriteList.reduce((map, favorite) => {
                    map[favorite.post_id] = true;
                    return map;
                }, {});

                // Update the mainList with favorited status
                mainListWithFavorites = mainList.map((item) => ({
                    ...item,
                    isFavorited: favoritedMap[item.id] || false,
                }));

            } else {
                let favoriteList = await db.favorite.findMany({
                    where: { user_id: Number(token.id) },
                })

                let mainList = await db.posts.findMany({
                    skip: (Number(data.offset) - 1) * Number(data.limit), // Calculate the number of records to skip based on page number
                    take: Number(data.limit), // Set the number of records to be returned per page
                })

                // Create a mapping of itemId to favorited status
                const favoritedMap = favoriteList.reduce((map, favorite) => {
                    map[favorite.post_id] = true;
                    return map;
                }, {});

                // Update the mainList with favorited status
                mainListWithFavorites = mainList.map((item) => ({
                    ...item,
                    isFavorited: favoritedMap[item.id] || false,
                }));
            }

            servResp.data = mainListWithFavorites
            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getHomeData(req) {
        let servResp = new config.serviceResponse()
        var mainListWithFavorites = []

        var homeData = []
        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {

            let favoriteList = await db.favorite.findMany({
                where: { user_id: Number(token.id) },
            })
           
            let categories = await db.categories.findMany()

            for (let cat in categories) {
                var obj = {};
                let mainList = await db.posts.findMany({
                    where: {
                        category_id: Number(cat.category_id)
                    },
                    take:10
                })
                
                const favoritedMap = favoriteList.reduce((map, favorite) => {
                    map[favorite.post_id] = true;
                    return map;
                }, {});

                mainListWithFavorites = mainList.map((item) => ({
                    ...item,
                    isFavorited: favoritedMap[item.id] || false,
                }));
                obj.category = item.name
                obj.items = mainListWithFavorites
                homeData.push(obj)
            }

            servResp.data = homeData
            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getFavoriteList(filters) {
        let servResp = new config.serviceResponse()
        var images = []
        console.log(post)

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.favorite.findMany({
                where: { user_id: Number(token.id) },
                skip: (filters.offset - 1) * filters.limit, // Calculate the number of records to skip based on page number
                take: filters.limit, // Set the number of records to be returned per page
                include: {
                    posts: true
                }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async setFavorite(post) {
        let servResp = new config.serviceResponse()
        var images = []
        console.log(post)

        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            if (post.post_id != null) {
                servResp.data = await db.favorite.delete({
                    where: { id }
                })

            } else {
                servResp.data = await db.favorite.create({
                    data: {
                        user_id: Number(token.id),
                        post_id: Number(post.post_id),
                        created_at: new Date(new Date().toUTCString())
                    }
                })
            }


            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }
}