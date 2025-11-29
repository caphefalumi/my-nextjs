import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<UserDocument> {
    const { googleId, email, name, picture, accessToken, refreshToken } = googleUser;

    let user = await this.userModel.findOne({ googleId });

    if (!user) {
      // Create new user (admin)
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
      // Update existing user
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    return user;
  }

  generateJwt(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
}
