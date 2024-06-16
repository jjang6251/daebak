import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MemberModule } from '../member/member.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemberService } from 'src/member/member.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    MemberModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // JwtModule 설정에서 ConfigModule를 가져오도록 설정합니다.
      inject: [ConfigService], // ConfigService를 주입합니다.
      useFactory: async (configService: ConfigService) => ({ // useFactory를 사용하여 설정 객체를 생성합니다.
        secret: configService.get<string>('JWT_SECRET'), // 환경변수에서 JWT_SECRET 값을 가져오고, 없을 경우 기본값으로 'secret'을 사용합니다.
        signOptions: { expiresIn: '10h' },
      }),
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
