import mongoose from 'mongoose';
import { logger } from '../logger';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    // Connect to MongoDB using the URI from env
    await mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    // If MongoDB fails to connect, the entire app is broken
    // Log the error clearly and exit with code 1 (failure)
    // process.exit(1) tells the OS something went wrong
    logger.error({ error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

// Listen to Mongoose connection events for observability
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});



// export async function connectDB(uri: string) {
//   return mongoose.connect(uri);
// }

// export async function disconnectDB() {
//   return mongoose.disconnect();
// }
