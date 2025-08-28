import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
import {v2 as cloudinary} from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_Api_Key,
  api_secret: process.env.Cloud_Api_Secret,
});
const app = express();

const PORT = process.env.PORT || 5001;

async function initDB() {
    try {
        await sql`
         CREATE TABLE IF NOT EXISTS blogs(
         id SERIAL PRIMARY KEY,
         title VARCHAR(255) NOT NULL,
         description VARCHAR(255) NOT NULL,
         blogcontent TEXT NOT NULL,
         image VARCHAR(255) NOT NULL,
         category VARCHAR(255) NOT NULL,
         author VARCHAR(255) NOT NULL,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `

        await sql`
         CREATE TABLE IF NOT EXISTS comments(
         id SERIAL PRIMARY KEY,
         comment VARCHAR(255) NOT NULL,
         user_id INT NOT NULL,
         username VARCHAR(255) NOT NULL,
         blog_id INT NOT NULL,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `

        await sql`
         CREATE TABLE IF NOT EXISTS savedblogs(
         id SERIAL PRIMARY KEY,
         user_id INT NOT NULL,
         blog_id INT NOT NULL,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
        )
        `
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
}

app.get("/", (req, res) => {
  res.send("Hello FROM Author Service!");
});

app.use(express.json());

app.use("/api/v1", blogRoutes);




initDB().then(() => {
  app.listen(PORT, () => console.log(`Running on ${PORT}`));
});


