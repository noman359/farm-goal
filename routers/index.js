import { Router } from "express"
import handler from '../handlers/index.js'
import customerRouter from "./customer.router.js"
import postsRouter from "./posts.router.js"


export default () => {
    let router = Router()
  //  todoRouter(router)
  //  vendorRouter(router)
    customerRouter(router)
   // serviceRouter(router)
    postsRouter(router)
  //  paymentRouter(router)
   // adminRouter(router)
    router.use(handler.apiResponseHandler)
    return router
}