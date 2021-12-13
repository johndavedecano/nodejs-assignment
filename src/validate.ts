import { validationResult } from 'express-validator';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    return res
      .status(422)
      .json({ errors: errors.array(), message: 'validation error' });
  };
};

export default validate
