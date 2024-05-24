import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {

  constructor(@InjectRepository(Member) private memberRepository:Repository<Member>){};

    async create(createMemberDto: CreateMemberDto) {
      const existingUser = await this.findOne(createMemberDto.useremail);
      if(existingUser) {
        throw new HttpException('이미 존재하는 userid입니다', HttpStatus.CONFLICT);
      }
      const saltRounds = 10;
      const hash = await bcrypt.hash(createMemberDto.password, saltRounds);
      const saveData = {
        useremail: createMemberDto.useremail,
        password: hash,
        name: createMemberDto.name,
        usertype: createMemberDto.usertype,
        nickname: createMemberDto.nickname
      };
      try {
        // 데이터베이스에 저장을 시도합니다.
        const newMember = this.memberRepository.create(saveData);
        await this.memberRepository.save(newMember);
      } catch (error) {
        // 저장이 실패한 경우 500 Internal Server Error 상태 코드와 함께 메시지를 반환합니다.
        throw new HttpException('회원가입에 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException('회원가입 완료', HttpStatus.CREATED);
    }

  findAll() {
    return `This action returns all member`;
  }

  async findOne(useremail: string) {
    return await this.memberRepository.findOne({where: {useremail}});
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
