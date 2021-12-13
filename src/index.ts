import * as http from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

import app from './server';

const start = async () => {
  try {
    const port = process.env.PORT || 3000;

    const server = http.createServer(app);

    server.listen(port);

    console.info(`server is listening to ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
