import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersEntity } from '../entities/users.entity';
import { NextFunction, Response } from 'express';
import { UsersService } from '../users/users.service';
import { verify } from 'jsonwebtoken';

export interface ExpressRequest extends Request {
  user?: UsersEntity;
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers['authorization']) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers['authorization'].split(' ')[1];

    try {
      const decode = verify(token, process.env.JWT_SECRET) as { email: string };

      const user = await this.usersService.findByEmail(decode.email);

      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}
