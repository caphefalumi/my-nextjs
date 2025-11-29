import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as crypto from 'crypto';

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

// Simple in-memory token store (use Redis in production)
const tokenStore = new Map<string, string>(); // token -> oderId

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<UserDocument> {
    const { googleId, email, name, picture, accessToken, refreshToken } = googleUser;

    // First try to find by email (preferred), then by googleId
    let user = await this.userModel.findOne({ email });
    
    if (!user) {
      user = await this.userModel.findOne({ googleId });
    }

    if (!user) {
      user = await this.userModel.create({
        googleId,
        email,
        name,
        picture,
        accessToken,
        refreshToken,
        role: 'admin',
      });
    } else {
      // Update existing user with latest Google info
      user.googleId = googleId;
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    return user;
  }

  generateToken(user: UserDocument): string {
    const token = crypto.randomBytes(32).toString('hex');
    tokenStore.set(token, user._id.toString());
    return token;
  }

  async getUserByToken(token: string): Promise<UserDocument | null> {
    const oderId = tokenStore.get(token);
    if (!oderId) return null;
    return this.userModel.findById(oderId);
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  invalidateToken(token: string): void {
    tokenStore.delete(token);
  }
}
