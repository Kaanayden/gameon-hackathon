import mongoose from 'mongoose';

export const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      dbName: 'Ton',
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.log(err);
    });
};
