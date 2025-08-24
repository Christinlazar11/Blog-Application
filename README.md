# Blog Application

A full-stack blog application built with Next.js, TypeScript, MongoDB, and Tailwind CSS. Users can create, edit, delete, and view blog posts with authentication.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes and API endpoints

### Blog Management
- Create new blog posts with title, content, tags, and status
- Edit existing blog posts
- Delete blog posts
- Draft and published status support
- Automatic slug generation from title
- Automatic excerpt generation from content

### User Dashboard
- View all user's blogs with statistics
- Filter blogs by status (draft/published)
- Quick actions for edit, view, and delete
- Blog creation form

### Public Features
- View published blogs on the home page
- Individual blog post pages
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Blogs
- `GET /api/blogs` - Get all blogs (with optional filtering)
- `POST /api/blogs` - Create a new blog (authenticated)
- `GET /api/blogs/[id]` - Get a specific blog
- `PUT /api/blogs/[id]` - Update a blog (authenticated, author only)
- `DELETE /api/blogs/[id]` - Delete a blog (authenticated, author only)

### User Profile
- `GET /api/profile` - Get current user profile (authenticated)

## Database Models

### User Model
```typescript
{
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}
```

### Blog Model
```typescript
{
  title: string;
  content: string;
  author: ObjectId (ref: User);
  status: "draft" | "published";
  slug?: string;
  excerpt?: string;
  tags?: string[];
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── blogs/
│   │   │   └── [id]/
│   │   └── profile/
│   ├── dashboard/
│   │   ├── new/
│   │   └── edit/[id]/
│   ├── blog/[slug]/
│   ├── login/
│   └── register/
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── Navigation.tsx
├── lib/
│   ├── auth.ts
│   ├── axios.ts
│   └── db.ts
└── models/
    ├── User.ts
    └── Blog.ts
```

## Usage

1. **Register/Login**: Users can register for a new account or login with existing credentials
2. **Dashboard**: After login, users are redirected to their dashboard where they can manage their blogs
3. **Create Blog**: Click "Create New Blog" to write a new blog post
4. **Edit Blog**: Click "Edit" on any blog to modify it
5. **Delete Blog**: Click "Delete" to remove a blog (with confirmation)
6. **View Blogs**: Click "View" to see the public version of a blog
7. **Public View**: Visit the home page to see all published blogs

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Author-only blog editing/deletion
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
