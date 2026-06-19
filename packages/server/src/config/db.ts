import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  return mongoose.connect(uri);
}

export async function disconnectDB() {
  return mongoose.disconnect();
}
