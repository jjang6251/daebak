import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/loginDto.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MemberService } from '../member/member.service';


@Injectable()
export class AuthService {
  constructor(
    private memberService: MemberService,
    private jwtService: JwtService,
  ) { }


  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.memberService.findOne(loginDto.useremail);

    if (!user) {
      throw new UnauthorizedException('로그인 유저 없음');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('로그인 유저 비밀번호 불일치');
    }

    const payload = { sub: user.id, useremail: user.useremail, name: user.name, nickname: user.nickname, usertype:user.usertype};
    const access_token = await this.jwtService.signAsync(payload)
    return {
      access_token: `Bearer ${access_token}`,
    };
  }
}
