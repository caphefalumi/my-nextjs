import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  password: string;
  name: string;
  email?: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Login with username and password
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;

    if (!username || !password) {
      return { error: 'Username and password are required' };
    }

    const user = await this.authService.validateUser(username, password);
    
    if (!user) {
      return { error: 'Invalid username or password' };
    }

    const token = this.authService.generateToken(user);
    
    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }

  // Register new user
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, name, email } = registerDto;

    if (!username || !password || !name) {
      return { error: 'Username, password, and name are required' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    const user = await this.authService.register(username, password, name, email);
    
    if (!user) {
      return { error: 'Username already exists' };
    }

    const token = this.authService.generateToken(user);
    
    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }

  // Get current user profile
  @Get('me')
  async getProfile(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided' };
    }

    const token = authHeader.split(' ')[1];
    const user = await this.authService.getUserByToken(token);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      picture: user.picture,
      companyName: user.companyName,
      role: user.role,
    };
  }

  // Logout
  @Post('logout')
  async logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      this.authService.invalidateToken(token);
    }
    return { success: true };
  }
}
