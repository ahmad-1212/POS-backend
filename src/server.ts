import app from './app';
import connectDB from './config/db';
import env from './config/env';
import { Server } from 'http';

//PORT
const PORT = env.PORT || 3000;

// Catch uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to db and create server
let server: Server;
connectDB().then(
  () =>
    (server = app.listen(PORT, () =>
      console.log('Server running on PORT: ' + PORT)
    ))
);

// Handle uncaught promise error
process.on('unhandledRejection', (err: Error) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', (err: Error) => {
  console.log('SIGTERM received shutdown gracefully!');
  server.close(() => {
    console.log('Process terminated!');
  });
});
