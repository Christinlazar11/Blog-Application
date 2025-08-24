import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  status: "draft" | "published";
  slug?: string;
  excerpt?: string;
  tags?: string[];
}

const BlogSchema: Schema<IBlog> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    slug: { type: String, unique: true, sparse: true },
    excerpt: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Create slug from title before saving
BlogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Ensure slug is not empty
    if (!this.slug) {
      this.slug = "blog-" + Date.now();
    }
  }
  
  // Generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 150) + "...";
  }
  
  next();
});

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog; 