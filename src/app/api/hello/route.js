import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';

export async function GET(request) {
    try {
        await dbConnect();
        return NextResponse.json({ message: 'Hello World! Connected to MongoDB.' });
    } catch (error) {
        console.error("API Hello Error:", error);
        return NextResponse.json({ message: 'Error connecting to DB', error: error.message }, { status: 500 });
    }
}