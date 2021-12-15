import { check } from 'express-validator';
import * as express from 'express';
import validate from './validate';
import * as multer from 'multer';

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

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!['text/csv'].includes(file.mimetype)) {
      return cb(new Error('file is not allowed'));
    }
    cb(null, true);
  },
});

export default class OrdersController {
  fixTotalPrice(items) {
    return items.map((item) => ({
      ...item,
      TotalPrice: item.PricePerItem * item.Quantity,
    }));
  }

  calculateTotal(items) {
    return items
      .map((line) => line.TotalPrice)
      .reduce((grandTotal, total) => grandTotal + total, 0);
  }

  update = (req, res, next) => {
    try {
      let order: Order;

      req.body.OrderLines = this.fixTotalPrice(req.body.OrderLines);

      if (!database.has(req.params.orderId)) {
        order = {
          OrderId: req.params.orderId,
          TotalPrice: this.calculateTotal(req.body.OrderLines),
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
        TotalPrice: this.calculateTotal(req.body.OrderLines),
        OrderLines: nextOrderLines,
      };

      database.set(req.params.orderId, nextOrder);

      res.json(nextOrder);
    } catch (err) {
      next(err);
    }
  };

  parseCsv(file) {
    try {
      const arr = file.buffer.toString('utf-8').split(/\r?\n/);
      const [keys, ...data] = arr;
      const columns = keys.split(',').map((c) => c.trim().replace('.', ''));
      const rows = data
        .filter((v) => v.length)
        .map((v) => {
          const obj = {};
          v.split(',').forEach((a, b) => {
            const num = parseFloat(a);
            obj[columns[b]] = isNaN(num) ? a : num;
          });
          return obj;
        });
      return rows;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  import = (req, res, next) => {
    try {
      const rows = this.parseCsv(req.file);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let order = database.get(row.orderId);

        if (!order) {
          order = {
            OrderId: row.orderId,
            TotalPrice: 0,
            OrderLines: [],
          };
        }

        const itemTotal = row.quantity * row.price;

        order.OrderLines.push({
          ItemId: row.itemId,
          Quantity: row.quantity,
          PricePerItem: row.price,
          TotalPrice: itemTotal,
        });

        order.TotalPrice = order.TotalPrice + itemTotal;

        database.set(row.orderId, order);
      }

      res.json([...database.values()]);
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
    router.post('/:orderId', validate(this.updateValidator), this.update);
    router.put('/:orderId', upload.single('file'), this.import);
    return router;
  }
}
