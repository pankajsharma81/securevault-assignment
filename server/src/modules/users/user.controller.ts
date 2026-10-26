import { Request, Response } from 'express';
import { loginSchema, registerSchema } from './user.schema';
import { UserService } from './user.service';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { USER_MESSAGES } from '../../shared/constants/user.constants';


export const registerHandler = asyncWrapper(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const user = await UserService.register(body);
  sendSuccess(res, user, USER_MESSAGES.REGISTERED, 201);
});

export const loginHandler = asyncWrapper(async (req: Request, res: Response) => {
  const { email, authKey } = loginSchema.parse(req.body);
  const result = await UserService.login(email, authKey);
  sendSuccess(res, result, USER_MESSAGES.LOGGED_IN);
});