import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Redirect to Google OAuth login page (just for UI, we won't use the token)
  @Get('google')
  async googleAuth(@Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3002/api/auth/google/callback';
    
    // Redirect to Google's OAuth page
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('email profile')}` +
      `&prompt=select_account`;
    
    res.redirect(googleAuthUrl);
  }

  // Google OAuth callback - exchange code for tokens and get user info
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    
    try {
      const code = req.query.code as string;
      
      if (!code) {
        return res.redirect(`${frontendUrl}/login?error=no_code`);
      }

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3002/api/auth/google/callback';

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        console.error('Token exchange failed:', tokenData);
        return res.redirect(`${frontendUrl}/login?error=token_failed`);
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const googleUserInfo = await userInfoResponse.json();

      if (!googleUserInfo.email) {
        console.error('Failed to get user info:', googleUserInfo);
        return res.redirect(`${frontendUrl}/login?error=userinfo_failed`);
      }

      const googleUser = {
        googleId: googleUserInfo.id,
        email: googleUserInfo.email,
        name: googleUserInfo.name || googleUserInfo.email.split('@')[0],
        picture: googleUserInfo.picture || `https://i.pravatar.cc/150?u=${googleUserInfo.email}`,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
      };

      const user = await this.authService.validateGoogleUser(googleUser);
      const token = this.authService.generateToken(user);
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
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
      email: user.email,
      name: user.name,
      picture: user.picture,
      companyName: user.companyName,
      role: user.role,
    };
  }

  // Logout
  @Get('logout')
  async logout(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login`);
  }
}
