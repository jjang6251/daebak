import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  
  beforeEach(async() => {
    const jwtService = new JwtService();
    const configService = new ConfigService();
    authGuard = new AuthGuard(jwtService, configService);
  })

  it('should be defined', () => {
    const jwtService = new JwtService();
    const configService = new ConfigService();
    expect(authGuard).toBeDefined();
  });

  it('jwt')
});
