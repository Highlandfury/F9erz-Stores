import mongoose from "mongoose";

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
    const uri = `${process.env.MONGODB_URI}/F9er`;
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    })
  }
    cached.conn = await cached.promise;
    return cached.conn;
}
export default dbConnect;
