import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: Partial<Repository<Member>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,  // 모킹된 memberRepository 사용
        }
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
