const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const logger = require('./config/logger');

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
};

startServer();