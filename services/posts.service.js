import handler from '../handlers/index.js'
import config from '../config/index.js'
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import admin from 'firebase-admin';
// import serviceAccount from '../urbancabsvender-firebase-adminsdk-70gg2-1c61b6ef2c.json' assert { type: "json" };
import { parse, format } from 'date-fns';
import TokenHandler from "../handlers/token.handler.js"
import { TargetTypeEnum } from 'inversify';

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // other configurations...
// });
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

                if (post.images.length > 1) {

                    for (var image of post.images) {
                        let post_image = new Object()
                        var arr = image.name.split('.')
                        let extentionName = arr[arr.length - 1]

                        let avatar_val = {
                            bucket: config.post_bucket_name,
                            key: `${currentDateTime.toISOString()}.${extentionName}`,
                            body: await bucket.fileToArrayBuffer(image)
                        }
                        post_image = await bucket.upload(avatar_val)
                        images.push(post_image.url)
                    }

                } else {
                    let image = post.images
                    let post_image = new Object()
                    var arr = image.name.split('.')
                    let extentionName = arr[arr.length - 1]

                    let avatar_val = {
                        bucket: config.post_bucket_name,
                        key: `${currentDateTime.toISOString()}.${extentionName}`,
                        body: await bucket.fileToArrayBuffer(image)
                    }
                    post_image = await bucket.upload(avatar_val)
                    images.push(post_image.url)
                }
            }

            var postImages = images.join(',')

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
                    years: Number(post.years),
                    months: Number(post.months),
                    city_id: Number(post.city_id),
                    status: 'active',
                    user_id: Number(token.id),
                    category_id: Number(post.category_id),
                    views: 0,
                    sub_category_id: Number(post.sub_category_id),
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
                include: { categories: true, subcategory: true, cities: true }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async deletePost(req) {
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

            servResp.data = await db.posts.delete({
                where: { id: Number(id) }
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async likePost(req) {
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

            servResp.data = await db.posts.delete({
                where: { id: Number(id) }
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
                        bucket: config.post_bucket_name,
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
                    status: 'active',
                    years: Number(post.years) ?? existingData.years,
                    months: Number(post.months) ?? existingData.months,
                    city_id: Number(post.city_id) ?? existingData.city_id,
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

    async getFeaturedList(req) {
        let servResp = new config.serviceResponse()
        let token = await tokenHandler.checkToken(req)
        if (token.isError == true) {
            servResp.isError = true
            servResp.message = 'Token is not valid'
            return servResp
        }

        try {
            console.debug('updating post() started')

            servResp.data = await db.posts.findMany({
                where: { featured: 1 },
                orderBy: {
                    created_at: 'asc'
                },
                take: 5, // Set the number of records to be returned per page
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

        const searchText = data.search || ''

        var query = {};

        if (searchText != '') {
            query.title = { contains: searchText };
        }

        if (data.min_price || data.max_price) {
            const minPrice = Number(data.min_price || '0')
            const maxPrice = Number(data.max_price || '100000000')
            query.price = {
                gte: minPrice,
                lte: maxPrice
            }
        }


        if (data.year) {
            query.years = Number(data.year);
        }

        if (data.month) {
            query.months = Number(data.month);
        }

        if (data.category_id) {
            query.category_id = Number(data.category_id)
        }


        try {
            console.debug('updating post() started')


            let favoriteList = await db.favorite.findMany({
                where: { user_id: Number(token.id) },
            })

            let mainList = await db.posts.findMany({
                where: query,
                orderBy: {
                    created_at: 'asc'
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


            servResp.data = mainListWithFavorites
            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async getMyAds(req) {
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

            let favoriteList = await db.favorite.findMany({
                where: { user_id: Number(token.id) },
            })

            let mainList = await db.posts.findMany({
                where: {
                    user_id: Number(token.id)
                },
                include: {
                    categories: true,
                    subcategory: true,
                    cities: true
                },
                orderBy: {
                    created_at: 'asc'
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

            let categoryList = await db.categories.findMany()

            for (let catItem of categoryList) {
                var obj = {};
                let mainList = await db.posts.findMany({
                    where: {
                        category_id: Number(catItem.id)
                    },
                    take: 10,
                    orderBy: {
                        created_at: 'asc'
                    },
                })

                const favoritedMap = favoriteList.reduce((map, favorite) => {
                    map[favorite.post_id] = true;
                    return map;
                }, {});

                mainListWithFavorites = mainList.map((item) => ({
                    ...item,
                    isFavorited: favoritedMap[item.id] || false,
                }));
                obj.category_id = catItem.id
                obj.category = catItem.category_name
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

    async getFavoriteList(req) {
        let servResp = new config.serviceResponse()
        var images = []
        var queryParams = req.query
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
                skip: (Number(queryParams.offset) - 1) * Number(queryParams.limit), // Calculate the number of records to skip based on page number
                take: Number(queryParams.limit), // Set the number of records to be returned per page
                include: {
                    posts: true
                },
                orderBy: {
                    created_at: 'asc'
                },
            })

            console.debug('updatePost() returning')

        } catch (error) {
            console.debug('createPost() exception thrown')
            servResp.isError = true
            servResp.message = error.message
        }
        return servResp
    }

    async setFavorite(req) {
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

            if (id != null || id != undefined) {
                let fav = await db.favorite.findFirst({
                    where: {
                        post_id: Number(id),
                        user_id: Number(token.id)
                    }
                })


                if (fav !== null) {
                    servResp.data = await db.favorite.delete({
                        where: {
                            id: Number(fav.id),
                            post_id: Number(id),
                            user_id: Number(token.id)
                        }
                    })
                    return servResp
                }

                servResp.data = await db.favorite.create({
                    data: {
                        user_id: Number(token.id),
                        post_id: Number(id),
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