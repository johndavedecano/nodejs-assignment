import * as express from 'express'

import auth from './auth'
import OrdersController from './orders.controller';

const orders = new OrdersController();

const app = express()

app.use(express.json())

app.get('/', (_req, res) => res.send('ok'))

app.use('/orders', auth, orders.routes);

export default app;
