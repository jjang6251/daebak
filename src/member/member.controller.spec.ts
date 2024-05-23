import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MemberController', () => {
  let controller: MemberController;
  let service: MemberService;
  let memberRepository: Partial<Repository<Member>>;

  beforeEach(async () => {
    memberRepository = {
      findOne: jest.fn().mockResolvedValue(null),  // findOne이 기본적으로 null을 반환하도록 모킹
      create: jest.fn().mockReturnValue({
        id: 1,
        useremail: 'jjang6252@gmail.com',
        password: 'hashedpassword',
        name: '장성원',
        usertype: '예비 창업자',
        nickname: '만리장성',
      }),
      save: jest.fn().mockResolvedValue({
        id: 1,
        useremail: 'jjang6252@gmail.com',
        password: 'hashedpassword',
        name: '장성원',
        usertype: '예비 창업자',
        nickname: '만리장성',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,  // 모킹된 memberRepository 사용
        },
      ],
    }).compile();

    controller = module.get<MemberController>(MemberController);
    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('회원가입 성공', async () => {
    const createMemberDto = {
      useremail: 'jjang6252@gmail.com',
      password: '1234',
      usertype: '예비 창업자',
      name: '장성원',
      nickname: '만리장성',
    };

    try {
      await controller.create(createMemberDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('회원가입 완료');
      expect(error.getStatus()).toBe(HttpStatus.CREATED);
    }

    // expect(service.create).toHaveBeenCalledWith(createMemberDto);
  });

  it('회원가입 이메일 중복', async () => {
    //given
    const createMemberDto = {
      useremail: 'jjang6252@gmail.com',
      password: '1234',
      usertype: '예비 창업자',
      name: '장성원',
      nickname: '만리장성',
    };
    const existingUser = {
      useremail: 'jjang6252@gmail.com',
    }
    //when
    memberRepository.findOne = jest.fn().mockResolvedValue(existingUser);

    //then

    try {
      await controller.create(createMemberDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('이미 존재하는 userid입니다');
      expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    }
  })

  it('회원가입 실패', async () => {
    const createMemberDto = {
      useremail: 'jjang6252@gmail.com',
      password: '1234',
      usertype: '예비 창업자',
      name: '장성원',
      nickname: '만리장성',
    };

    memberRepository.save = jest.fn(() => {
      throw new Error;
    });

    try {
      await controller.create(createMemberDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('회원가입에 실패했습니다.');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    
  })
});
