import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET!;

export function signJwt(payload: object, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyJwt<T extends object>(token: string): T | null {
    try {
      return jwt.verify(token, JWT_SECRET) as T;
    } catch {
      return null;
    }
  }