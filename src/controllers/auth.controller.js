import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { signupSchema } from '#validations/auth.validations.js';
import { createUser } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const { name, email, password, role } = validationResult.data;
    const user = await createUser({ name, email, password, role });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, { httpOnly: true });
    logger.info('User registered successfully: ${email}');
    res.status(201).json({
      message: 'User Registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signup controller', error);
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email Already exists' });
    }
    next(error);
  }
};
