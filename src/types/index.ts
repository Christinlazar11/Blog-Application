export interface Blog {
  _id: string;
  title: string;
  content: string;
  status: "draft" | "published";
  slug?: string;
  excerpt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  parentComment?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface BlogForm {
  title: string;
  content: string;
  status: "draft" | "published";
  tags: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
} 