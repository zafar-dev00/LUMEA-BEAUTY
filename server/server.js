const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv } = require('./config/env');

const start = async () => {
  await connectDB();

  const server = app.listen(port, () => {
    console.log(`LUMÉA BEAUTY API running in ${nodeEnv} mode on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✖ Port ${port} is already in use. Stop the running server or change PORT in your .env file.`);
      process.exit(1);
    }

    console.error(`✖ Server failed to start: ${err.message}`);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
