// Example: src/app/api/protected-example/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Adjust path if needed

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  return NextResponse.json({ message: `Welcome ${session.user.name || session.user.email}! This is protected data.` });
}