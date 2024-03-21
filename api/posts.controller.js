import { Router } from 'express';
import TokenHandler from "../handlers/token.handler.js"
import PostService from "../services/posts.service.js";

let customerServ = new PostService()
let tokenHandler = new TokenHandler()


export default class PostController {

    constructor() { }

    async createPost(req, res, next) {
        let created_customer = await customerServ.createPost(req)
        next(created_customer)
    }

    async updatePost(req, res, next) {
        let created_customer = await customerServ.updatePost(req)
            next(created_customer)
    }

    async getPostDetail(req, res, next) {
        let created_customer = await customerServ.getPostDetails(req)
         next(created_customer)
    }

    async deletePost(req, res, next) {
        let created_customer = await customerServ.deletePost(req)
         next(created_customer)
    }

    async incrementView(req, res, next) {
        let created_customer = await customerServ.incrementPostViews(req)
         next(created_customer)
    }

    async changeAdStatus(req, res, next) {
        let created_customer = await customerServ.changePostStatus(req)
         next(created_customer)
    }

    async featured(req, res, next) {
        let created_customer = await customerServ.changeFeaturedStatus(req)
         next(created_customer)
    }
    
    async getPosts(req, res, next) {
        let created_customer = await customerServ.getPosts(req)
         next(created_customer)
    }

    async setFavorite(req, res, next) {
        let created_customer = await customerServ.setFavorite(req)
         next(created_customer)
    }

    async getMyads(req, res, next) {
        let created_customer = await customerServ.getMyAds(req)
         next(created_customer)
    }

    async getHomeData(req, res, next) {
        let created_customer = await customerServ.getHomeData(req)
         next(created_customer)
    }

    async getFavoriteData(req, res, next) {
        let created_customer = await customerServ.getFavoriteList(req)
         next(created_customer)
    }

}