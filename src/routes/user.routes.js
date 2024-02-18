import { Router } from "express";
import { registerUser,loginUser } from "../controllers/user.contoller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { logoutUser } from "../controllers/user.contoller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),
    registerUser
    );
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
export default router