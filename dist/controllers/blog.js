import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import TryCatchHandler from "../utils/TryCatchHandler.js";
import { v2 as cloudinary } from "cloudinary";
export const createBlog = TryCatchHandler(async (req, res) => {
    const { title, description, blogcontent, category } = req.body;
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: "Bad Request: File is required" });
        return;
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({ message: "Bad Request: Failed to generate buffer" });
        return;
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const result = await sql `INSERT INTO blogs (title, description, blogcontent, image, category, author)
    VALUES (${title}, ${description}, ${blogcontent}, ${cloudinaryResponse.secure_url}, ${category}, ${req.user?._id})
    RETURNING *
  `;
    res.status(201).json({ message: "Blog created successfully", blog: result[0] });
});
export const updateBlog = TryCatchHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, blogcontent, category } = req.body;
    const file = req.file;
    const existingBlog = await sql `SELECT * FROM blogs WHERE id=${id}`;
    if (existingBlog.length === 0) {
        res.status(404).json({ message: "Blog not found" });
        return;
    }
    if (existingBlog[0].author !== req.user?._id) {
        res.status(403).json({ message: "Forbidden: You are not the author of this blog" });
        return;
    }
    let imageUrl = existingBlog[0].image;
    if (file) {
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            res.status(400).json({ message: "Bad Request: Failed to generate buffer" });
            return;
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(fileBuffer.content, {
            folder: "blogs"
        });
        imageUrl = cloudinaryResponse.secure_url;
    }
    const updatedBlog = await sql `UPDATE blogs SET
    title=${title || existingBlog[0].title},
    description=${description || existingBlog[0].description},
    blogcontent=${blogcontent || existingBlog[0].blogcontent},
    image=${imageUrl || existingBlog[0].image},
    category=${category || existingBlog[0].category}
  WHERE id=${id}
  RETURNING *`;
    res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog[0] });
});
export const deleteBlog = TryCatchHandler(async (req, res) => {
    const { id } = req.params;
    const existingBlog = await sql `SELECT * FROM blogs WHERE id=${id}`;
    if (!existingBlog.length) {
        res.status(404).json({ message: "Blog not found" });
        return;
    }
    if (existingBlog[0].author !== req.user?._id) {
        res.status(403).json({ message: "Forbidden: You are not the author of this blog" });
        return;
    }
    await cloudinary.uploader.destroy(`blogs/${existingBlog[0].image.split("/").pop()?.split(".")[0]}`);
    await sql `DELETE FROM comments WHERE blog_id=${id}`;
    await sql `DELETE FROM savedblogs WHERE blog_id=${id}`;
    await sql `DELETE FROM blogs WHERE id=${id}`;
    res.status(200).json({ message: "Blog deleted successfully" });
});
