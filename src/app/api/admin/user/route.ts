import { NextResponse } from "next/server";
import User from "@/src/models/User";
import { connectDB } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { verifyJwt } from "@/src/lib/auth";

// Helper to validate admin token
async function validateAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const decoded = verifyJwt<{ userId: string; role: string }>(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return decoded;
}

export async function GET(req: Request) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const users = await User.find({ role: "user" }).select("-password");
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const body = await req.json();

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = await User.create({
    ...body,
    password: hashedPassword,
  });

  // exclude password in response
  const { password, ...userWithoutPassword } = user.toObject();

  return NextResponse.json({ user: userWithoutPassword });
}
