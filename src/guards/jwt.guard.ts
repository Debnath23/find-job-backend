import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth/auth.service';
import { UsersEntity } from '../entities/users.entity';
import { verify } from 'jsonwebtoken';
import { NextFunction } from 'express';

export interface ExpressRequest extends Request {
  user?: UsersEntity;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(req: ExpressRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.warn('No authorization header found');
      req.user = null;
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as {
        email: string;
      };

      const user = await this.authService.findByEmail(decoded.email);
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
