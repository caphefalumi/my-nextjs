import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const token = this.authService.generateJwt(user);
    
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    const user = await this.authService.findUserById(req.user.sub);
    if (!user) {
      return { error: 'User not found' };
    }
    
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      companyName: user.companyName,
      role: user.role,
    };
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/login`);
  }
}
