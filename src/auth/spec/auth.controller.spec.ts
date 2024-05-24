import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MemberService } from '../../member/member.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberModule } from 'src/member/member.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth.module';
import exp from 'constants';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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
      }),  // findOne이 기본적으로 null을 반환하도록 모킹
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule], // JwtModule 설정에서 ConfigModule를 가져오도록 설정합니다.
          inject: [ConfigService], // ConfigService를 주입합니다.
          global: true,
          useFactory: async (configService: ConfigService) => ({ // useFactory를 사용하여 설정 객체를 생성합니다.
            secret: configService.get<string>('JWT_SECRET', 'secret'), // 환경변수에서 JWT_SECRET 값을 가져오고, 없을 경우 기본값으로 'secret'을 사용합니다.
            signOptions: { expiresIn: '10h' },
          }),
        }),

      ],
      controllers: [AuthController],
      providers: [AuthService, MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,  // 모킹된 memberRepository 사용
        },],
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
      useremail: "jjang6251@gmail.com",
      password: '1234'
    };

    const response = await controller.login(loginDto);
    expect(response.access_token).toBeDefined(); // access_token이 정의되어 있는지 확인
  });

  it('로그인 user 없음', async() => {
    const loginDto = {
      useremail: "jjang6252@gmail.com",
      password: '1234'
    };

    try {
      expect(await controller.login(loginDto))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('로그인 유저 없음');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('로그인 user 비밀번호 불일치', async() => {
    const loginDto = {
      useremail: "jjang6251@gmail.com",
      password: '12345'
    };

    try {
      expect(await controller.login(loginDto))
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('로그인 유저 비밀번호 불일치');
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });
});
