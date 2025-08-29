import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import { createBlog, updateBlog, deleteBlog } from "../controllers/blog.js";
const router = express.Router();
router.post("/blog/new", isAuth, uploadFile, createBlog);
router.patch("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
export default router;
