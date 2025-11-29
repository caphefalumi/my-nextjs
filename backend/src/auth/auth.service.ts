import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as crypto from 'crypto';

// Simple in-memory token store (use Redis in production)
const tokenStore = new Map<string, string>(); // token -> userId

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create admin account on startup
  async onModuleInit() {
    await this.createAdminAccount();
  }

  private async createAdminAccount() {
    const existingAdmin = await this.userModel.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = this.hashPassword('123456789');
      await this.userModel.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@luminus.ai',
        name: 'Administrator',
        picture: 'https://i.pravatar.cc/150?u=admin',
        role: 'admin',
      });
      console.log('Admin account created: username=admin, password=123456789');
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async validateUser(username: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;
    
    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) return null;
    
    return user;
  }

  async register(username: string, password: string, name: string, email?: string): Promise<UserDocument | null> {
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) return null;

    const hashedPassword = this.hashPassword(password);
    const user = await this.userModel.create({
      username,
      password: hashedPassword,
      email: email || `${username}@luminus.ai`,
      name,
      picture: `https://i.pravatar.cc/150?u=${username}`,
      role: 'user',
    });

    return user;
  }

  generateToken(user: UserDocument): string {
    const token = crypto.randomBytes(32).toString('hex');
    tokenStore.set(token, user._id.toString());
    return token;
  }

  async getUserByToken(token: string): Promise<UserDocument | null> {
    const userId = tokenStore.get(token);
    if (!userId) return null;
    return this.userModel.findById(userId);
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  invalidateToken(token: string): void {
    tokenStore.delete(token);
  }
}
