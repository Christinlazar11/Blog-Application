import { NextResponse } from "next/server";
import { verifyJwt } from "@/src/lib/auth";
import User from "@/src/models/User";
import { connectDB } from "@/src/lib/db";

interface JwtPayload {
  userId: string;
  role: string;
  email?: string;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyJwt<JwtPayload>(token);

  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(decoded.userId).select("-password");

  return NextResponse.json({ user });
}
