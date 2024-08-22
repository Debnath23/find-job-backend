import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersEntity } from '../entities/users.entity';
import { NextFunction, Response } from 'express';
import { UsersService } from '../users/users.service';
import { verify } from 'jsonwebtoken';
import { ApiResponse } from '../responseTypes/ApiResponse';

export interface ExpressRequest extends Request {
  user?: UsersEntity;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      req.user = null;
      next();
      return ApiResponse(null, 'No authentication header is found!', 404);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as { email: string };

      const user = await this.usersService.findByEmail(decoded.email);
      if (!user) {
        req.user = null;
        return ApiResponse(null, `User not found for email: ${decoded.email}`, 404)
      } else {
        req.user = user;
      }

      next();
    } catch (error) {
      req.user = null;
      next();
      return ApiResponse(null, `JWT Verification Error: ${error.message}`, 400)
    }
  }
}
