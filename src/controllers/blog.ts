import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import TryCatchHandler from "../utils/TryCatchHandler.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog=TryCatchHandler(async(req:AuthenticatedRequest, res)=>{

  const { title, description, blogcontent, category } = req.body;

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "Bad Request: File is required" });
    return;
  }
 
  const fileBuffer = getBuffer(file);
  if(!fileBuffer || !fileBuffer.content){
    res.status(400).json({ message: "Bad Request: Failed to generate buffer" });
    return;
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result= await sql`INSERT INTO blogs (title, description, blogcontent, image, category, author)
    VALUES (${title}, ${description}, ${blogcontent}, ${cloudinaryResponse.secure_url}, ${category}, ${req.user?._id})
    RETURNING *
  `;
 

  res.status(201).json({ message: "Blog created successfully", blog: result[0] });
});
