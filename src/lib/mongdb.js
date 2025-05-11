import mongoose from 'mongoose';


console.log("------------------------------------");
console.log("Attempting to read MONGODB_URI from process.env:");
console.log("Value (MONGODB_URI):", process.env.MONGODB_URI);
console.log("Type (MONGODB_URI):", typeof process.env.MONGODB_URI);
console.log("---");
console.log("Attempting to read TEST_ENV_VAR from process.env:");
console.log("Value (TEST_ENV_VAR):", process.env.TEST_ENV_VAR);
console.log("Type (TEST_ENV_VAR):", typeof process.env.TEST_ENV_VAR);
console.log("------------------------------------");


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
           
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => { // Renamed mongoose to mongooseInstance to avoid conflict
            return mongooseInstance;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;