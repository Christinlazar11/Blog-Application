import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Blog from "@/src/models/Blog";

export async function GET() {
  try {
    await connectDB();
    
    // Get all unique tags from published blogs
    const blogs = await Blog.find({ status: "published" }).select("tags");
    
    // Extract and flatten all tags
    const allTags = blogs
      .map(blog => blog.tags || [])
      .flat()
      .filter(tag => tag && tag.trim() !== "");
    
    // Get unique tags and sort them
    const uniqueTags = [...new Set(allTags)].sort();
    
    return NextResponse.json({ tags: uniqueTags });
  } catch (error: unknown) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
