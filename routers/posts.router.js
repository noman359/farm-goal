import handler from '../handlers/index.js';
import formData from '../middlewares/formdata-parser.js';
import { Router } from 'express';
import PostController from '../api/posts.controller.js';

const jobsController = new PostController()
const lRoute = Router();
export default function (router) {
    router.use('/post', lRoute)
    lRoute.post('/create', formData, jobsController.createPost,handler.apiResponseHandler)
    lRoute.put('/:id', formData ,jobsController.updatePost,handler.apiResponseHandler)
    lRoute.delete('/:id' ,jobsController.deletePost,handler.apiResponseHandler)
    lRoute.get('/detail/:id', jobsController.getPostDetail,handler.apiResponseHandler)
    lRoute.post('/view/:id', jobsController.incrementView,handler.apiResponseHandler)
    lRoute.post('/status/:id', jobsController.changeAdStatus,handler.apiResponseHandler)
    lRoute.post('/featured/:id', jobsController.featured,handler.apiResponseHandler)
    lRoute.get('/list', jobsController.getPosts,handler.apiResponseHandler)
    lRoute.post('/like/:id', jobsController.setFavorite,handler.apiResponseHandler)
    lRoute.get('/myads', jobsController.getMyads,handler.apiResponseHandler)
    lRoute.get('/home', jobsController.getHomeData,handler.apiResponseHandler)
    lRoute.get('/favoriteList', jobsController.getFavoriteData,handler.apiResponseHandler)

}