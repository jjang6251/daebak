import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MemberService } from '../../member/member.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '../auth.guard';
import { Reflector } from '@nestjs/core';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let memberService: MemberService;
  let jwtService: JwtService;
  let memberRepository: Partial<Repository<Member>>;

  beforeEach(async () => {
    const saltRounds = 10;
    const hash = await bcrypt.hash('1234', saltRounds);
    memberRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        useremail: 'jjang6251@gmail.com',
        password: hash,
        name: '장성원',
        usertype: '예비 창업자',
        nickname: '만리장성',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET', 'secret'),
            signOptions: { expiresIn: '10h' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
              const req = context.switchToHttp().getRequest();
              if(!req.headers.authorization){
                throw new UnauthorizedException();
              }
              return true;
            }),
          },
        },
        ConfigService,
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    memberService = module.get<MemberService>(MemberService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('로그인 access_token 발행', async () => {
    const loginDto = {
      useremail: 'jjang6251@gmail.com',
      password: '1234',
    };

    const response = await controller.login(loginDto);
    expect(response.access_token).toBeDefined(); // access_token이 정의되어 있는지 확인
  });

  it('로그인 user 없음', async () => {
    const loginDto = {
      useremail: 'jjang6252@gmail.com',
      password: '1234',
    };

    try {
      await controller.login(loginDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('로그인 유저 없음');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('로그인 user 비밀번호 불일치', async () => {
    const loginDto = {
      useremail: 'jjang6251@gmail.com',
      password: '12345',
    };

    try {
      await controller.login(loginDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('로그인 유저 비밀번호 불일치');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('로그인 체크(헤더 없을 경우)', async () => {
    try {
      await controller.check();
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('Unauthorized');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });
});
