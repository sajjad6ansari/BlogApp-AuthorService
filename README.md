# BlogApp Author Service

A dedicated microservice for blog content management built with Node.js, Express, TypeScript, and PostgreSQL. This service handles blog creation, editing, deletion, and integrates with RabbitMQ for cache invalidation and real-time communication.

## 🚀 Features

### Blog Management
- **Blog CRUD Operations**: Complete create, read, update, and delete functionality
- **Image Upload**: Cloudinary integration for blog image management
- **Author Authorization**: Author-only access control for blog modifications
- **Rich Content Support**: Full blog content management with descriptions and categories

### Data Management
- **PostgreSQL Database**: Robust relational database with NeonDB serverless
- **Multiple Tables**: Blogs, comments, and saved blogs management
- **Relationship Management**: Foreign key relationships between entities
- **Transaction Support**: ACID compliance for data integrity

### Integration & Communication
- **RabbitMQ Integration**: Message queue for cache invalidation
- **Cache Management**: Automated cache invalidation on data changes
- **Microservice Communication**: Event-driven architecture
- **JWT Authentication**: Secure token-based authorization

## 🛠️ Tech Stack

### Backend Framework
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript 5.9+
- **Database**: PostgreSQL with NeonDB Serverless
- **Queue System**: RabbitMQ with amqplib

### Key Dependencies
- **Database**: `@neondatabase/serverless`
- **Message Queue**: `amqplib`
- **File Upload**: `multer`, `cloudinary`, `datauri`
- **Authentication**: `jsonwebtoken`
- **Development**: `concurrently`, `nodemon`

### Containerization
- **Docker**: Containerized service for consistent deployment
- **Docker Hub**: [sajjad6ansari/author_service](https://hub.docker.com/repository/docker/sajjad6ansari/author_service)
- **Base Image**: Node.js Alpine for lightweight containers
- **Production Ready**: Optimized Docker configuration

## 📁 Project Structure

```
src/
├── server.ts                 # Application entry point & DB initialization
├── controllers/
│   └── blog.ts              # Blog management operations
├── middlewares/
│   ├── isAuth.ts            # JWT authentication middleware
│   └── multer.ts            # File upload middleware
├── routes/
│   └── blog.ts              # API route definitions
└── utils/
    ├── db.ts                # NeonDB connection
    ├── rabbitamq.ts         # RabbitMQ setup & messaging
    ├── dataUri.ts           # File buffer utilities
    └── TryCatchHandler.ts   # Error handling wrapper
```

## 🗄️ Database Schema

### Tables Structure

#### Blogs Table
```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  blogcontent TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  comment VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  blog_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Saved Blogs Table
```sql
CREATE TABLE savedblogs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  blog_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Blog Management Routes
```http
POST   /api/v1/blog/new       # Create new blog (Auth + File Upload)
PATCH  /api/v1/blog/:id       # Update existing blog (Auth + File Upload)
DELETE /api/v1/blog/:id       # Delete blog (Auth Required)
```

### Request/Response Examples

#### Create Blog
```bash
curl -X POST http://localhost:5001/api/v1/blog/new \
  -H "Authorization: Bearer your_jwt_token" \
  -F "title=My Blog Title" \
  -F "description=Blog description" \
  -F "blogcontent=Full blog content here..." \
  -F "category=Technology" \
  -F "image=@/path/to/image.jpg"
```

#### Update Blog
```bash
curl -X PATCH http://localhost:5001/api/v1/blog/123 \
  -H "Authorization: Bearer your_jwt_token" \
  -F "title=Updated Blog Title" \
  -F "description=Updated description"
```

#### Delete Blog
```bash
curl -X DELETE http://localhost:5001/api/v1/blog/123 \
  -H "Authorization: Bearer your_jwt_token"
```

## 🔄 Message Queue Integration

### RabbitMQ Configuration
- **Connection**: Local RabbitMQ instance (amqp://admin:admin123@localhost:5672)
- **Queue**: `author_queue` for service-specific messages
- **Cache Queue**: `cache-invalidation` for cache management

### Cache Invalidation Flow
1. **Blog Operation**: Create/Update/Delete blog
2. **Generate Keys**: Determine affected cache keys (`blogs:*`, `blogs:${id}`)
3. **Publish Message**: Send invalidation message to RabbitMQ
4. **Cache Cleanup**: Blog Service receives and processes invalidation

### Message Format
```typescript
interface CacheInvalidationMessage {
  action: 'invalidateCache';
  keys: string[];
}
```

## 🔐 Security & Authorization

### JWT Authentication
- **Header Format**: `Authorization: Bearer <token>`
- **Middleware**: `isAuth` validates JWT tokens
- **User Context**: Extracts user information from token payload

### Author-Only Operations
- **Ownership Verification**: Only blog authors can modify their content
- **403 Forbidden**: Returns error for unauthorized modification attempts
- **Resource Protection**: All CUD operations require author verification

### Input Validation
- **Required Fields**: Validates essential blog data
- **File Upload**: Secure image upload with buffer validation
- **SQL Injection Protection**: Parameterized queries with NeonDB

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (NeonDB account)
- RabbitMQ instance
- Cloudinary account

### Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5001

# Database
DB_URL=postgresql://username:password@host/database

# JWT Security
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
Cloud_Name=your_cloudinary_cloud_name
Cloud_Api_Key=your_cloudinary_api_key
Cloud_Api_Secret=your_cloudinary_api_secret
```

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

### Database Initialization
The service automatically creates required tables on startup:
- Blogs table for content storage
- Comments table for user interactions
- Saved blogs table for user bookmarks

## 🐳 Docker Deployment

### Docker Configuration
The service is containerized and available on Docker Hub for easy deployment:

#### Dockerfile Structure
```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine 

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]
```

### Docker Hub Repository
- **Image**: [sajjad6ansari/author_service](https://hub.docker.com/repository/docker/sajjad6ansari/author_service)
- **Tags**: Available with version tags and `latest`

### Docker Commands

#### Pull and Run from Docker Hub
```bash
docker pull sajjad6ansari/author_service:latest
docker run -d \
  --name author-service \
  -p 5001:5001 \
  --env-file .env \
  sajjad6ansari/author_service:latest
```

#### Build Local Image
```bash
docker build -t author-service .
docker run -d \
  --name author-service \
  -p 5001:5001 \
  --env-file .env \
  author-service
```

### Container Features
- **Multi-stage Build**: Optimized production image size
- **Alpine Base**: Lightweight and secure base image
- **Production Dependencies**: Only necessary packages in final image
- **Environment Variables**: Configurable via .env file

## 🏗️ Architecture Patterns

### Controller Pattern
- **Business Logic**: Centralized in controller functions
- **Error Handling**: TryCatchHandler wrapper for consistent error management
- **Response Format**: Standardized JSON responses

### Middleware Pattern
- **Authentication**: JWT verification for protected routes
- **File Upload**: Multer configuration for image handling
- **Error Boundaries**: Centralized error handling

### Event-Driven Architecture
- **Message Publishing**: RabbitMQ for cache invalidation
- **Asynchronous Processing**: Non-blocking message queue operations
- **Service Decoupling**: Loose coupling between services

## 🔄 Data Flow

### Blog Creation Flow
1. **Request Validation**: Authenticate user and validate input
2. **Image Upload**: Process and upload image to Cloudinary
3. **Database Insert**: Store blog data in PostgreSQL
4. **Cache Invalidation**: Publish cache clear message
5. **Response**: Return created blog data

### Blog Update Flow
1. **Authorization Check**: Verify user is blog author
2. **Conditional Upload**: Upload new image if provided
3. **Database Update**: Update blog with new/existing data
4. **Cache Invalidation**: Clear relevant cache keys
5. **Response**: Return updated blog data

### Blog Deletion Flow
1. **Authorization Check**: Verify user is blog author
2. **Image Cleanup**: Remove image from Cloudinary
3. **Cascade Delete**: Remove comments and saved references
4. **Blog Removal**: Delete blog from database
5. **Cache Invalidation**: Clear all related cache entries

## 🔄 Integration Points

This service integrates with:
- **User Service**: Authentication and user data
- **Blog Service**: Cache synchronization via RabbitMQ
- **Frontend Application**: Blog management interface
- **Cloudinary**: Image storage and management

## 🚧 Development Notes

### Current Implementation
- ✅ **Complete CRUD**: Full blog management operations
- ✅ **Authentication**: JWT-based author verification
- ✅ **File Upload**: Cloudinary image integration
- ✅ **Database**: PostgreSQL with auto-initialization
- ✅ **Message Queue**: RabbitMQ cache invalidation
- ✅ **Type Safety**: Full TypeScript implementation

### Future Enhancements
- Blog versioning and revision history
- Bulk operations for multiple blogs
- Advanced image processing and optimization
- Blog templates and themes
- Draft/publish workflow
- SEO metadata management
- Analytics and performance metrics

## 📊 Performance Considerations

### Database Optimization
- **Indexed Queries**: Primary keys and foreign keys indexed
- **Connection Pooling**: NeonDB serverless auto-scaling
- **Query Optimization**: Parameterized queries for performance

### File Upload Optimization
- **Buffer Processing**: Efficient file buffer handling
- **Cloudinary CDN**: Global content delivery network
- **Image Optimization**: Automatic format optimization

### Message Queue Performance
- **Durable Queues**: Persistent message storage
- **Acknowledgments**: Reliable message processing
- **Connection Management**: Persistent RabbitMQ connections

## 📄 License

This microservice is part of the BlogApp Microservices architecture.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper TypeScript types
4. Add database migrations if needed
5. Test all CRUD operations
6. Verify RabbitMQ integration
7. Submit a pull request

## 📞 Support

For questions regarding the Author Service:
- Review the API endpoint documentation
- Check database schema and relationships
- Examine RabbitMQ message flow
- Test with provided curl examples
- Verify JWT token format and permissions
