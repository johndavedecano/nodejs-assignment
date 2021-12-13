import { check } from 'express-validator';
import * as express from 'express';
import validate from './validate';

interface OrderLine {
  ItemId?: string;
  Quantity?: number;
  PricePerItem?: number;
  TotalPrice?: number;
}

interface Order {
  OrderId?: string;
  TotalPrice?: number;
  OrderLines?: OrderLine[];
}

const database: Map<string, Order> = new Map();

export default class OrdersController {
  calculateLineTotal(items) {
    return items.reduce((total, line) => {
      total = line.PricePerItem * line.Quantity + total;
    }, 0);
  }

  update = (req, res, next) => {
    try {
      let order: Order;
      if (!database.has(req.params.orderId)) {
        order = {
          OrderId: req.params.orderId,
          TotalPrice: this.calculateLineTotal(req.body.OrderLines),
          OrderLines: req.body.OrderLines || [],
        };
        database.set(req.params.orderId, order);
        return res.json(order);
      }

      order = database.get(req.params.orderId);

      const nextOrderLines: OrderLine[] = order.OrderLines.concat(
        req.body.OrderLines,
      );

      const nextOrder: Order = {
        ...order,
        OrderId: req.params.orderId,
        TotalPrice: this.calculateLineTotal(nextOrderLines),
        OrderLines: nextOrderLines,
      };

      database.set(req.params.orderId, nextOrder);

      res.json(nextOrder);
    } catch (err) {
      next(err);
    }
  };

  get updateValidator() {
    return [
      check('OrderId').isString(),
      check('TotalPrice').isNumeric(),
      check('OrderLines').isArray(),
      check('OrderLines.*.ItemId').isString(),
      check('OrderLines.*.Quantity').isNumeric(),
      check('OrderLines.*.PricePerItem').isNumeric(),
      check('OrderLines.*.TotalPrice').isNumeric(),
    ];
  }

  get routes() {
    const router = express.Router();
    router.put('/:orderId', validate(this.updateValidator), this.update);
    return router;
  }
}
