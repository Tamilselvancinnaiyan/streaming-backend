import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { MODELS } from '../database/database.constants';
import { AppModels } from '../database/models';

type AuthPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(@Inject(MODELS) private readonly models: AppModels) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hashHex] = stored.split(':');
    if (!salt || !hashHex) return false;
    const inputHash = scryptSync(password, salt, 64);
    const storedHash = Buffer.from(hashHex, 'hex');
    if (inputHash.length !== storedHash.length) return false;
    return timingSafeEqual(inputHash, storedHash);
  }

  private signToken(payload: AuthPayload) {
    const secret = process.env.AUTH_JWT_SECRET || 'change-me-auth-secret';
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): AuthPayload {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('invalid token format');
    }

    const secret = process.env.AUTH_JWT_SECRET || 'change-me-auth-secret';
    const expected = createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length) {
      throw new UnauthorizedException('invalid token signature');
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new UnauthorizedException('invalid token signature');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as AuthPayload;

    if (Date.now() >= payload.exp * 1000) {
      throw new UnauthorizedException('token expired');
    }

    return payload;
  }

  private sanitizeUser(user: any) {
    return {
      id: user.get('id'),
      name: user.get('name'),
      email: user.get('email'),
      role: user.get('role'),
      createdAt: user.get('createdAt'),
      updatedAt: user.get('updatedAt'),
      lastLoginAt: user.get('lastLoginAt'),
    };
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
    role?: 'viewer' | 'host' | 'admin';
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.models.User.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('email already registered');
    }

    const user = await this.models.User.create({
      name: input.name.trim(),
      email,
      password_hash: await this.hashPassword(input.password),
      role: input.role ?? 'viewer',
    });

    const nowSec = Math.floor(Date.now() / 1000);
    const token = this.signToken({
      sub: String(user.get('id')),
      email: String(user.get('email')),
      role: String(user.get('role')),
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7,
    });

    return { token, user: this.sanitizeUser(user) };
  }

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await this.models.User.findOne({ where: { email } });
const passwordHash = user?.get('password_hash');
    if (!user || !this.verifyPassword(input.password, String(passwordHash))) {
      throw new UnauthorizedException('invalid email or password');
    }

    await user.update({ lastLoginAt: new Date() });

    const nowSec = Math.floor(Date.now() / 1000);
    const token = this.signToken({
      sub: String(user.get('id')),
      email: String(user.get('email')),
      role: String(user.get('role')),
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7,
    });

    return { token, user: this.sanitizeUser(user) };
  }

  async me(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('missing bearer token');
    }

    const token = authorizationHeader.replace('Bearer ', '').trim();
    const payload = this.verifyToken(token);

    const user = await this.models.User.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    return this.sanitizeUser(user);
  }
}
