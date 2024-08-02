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
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.warn('No authorization header found');
      req.user = null;
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as { email: string };

      const user = await this.usersService.findByEmail(decoded.email);
      if (!user) {
        console.warn(`User not found for email: ${decoded.email}`);
        req.user = null;
      } else {
        req.user = user;
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      req.user = null;
      next();
    }
  }
}
