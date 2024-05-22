import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberController } from './member/member.controller';
import { MemberModule } from './member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member/entities/member.entity';

@Module({

  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '34.136.153.222',
      port: 3306,
      username: 'jjang',
      password: 'assaassa0319',
      database: 'daebak',
      entities: [Member],
      synchronize: true,
    }),
    MemberModule],
  controllers: [AppController, MemberController],
  providers: [AppService],
})
export class AppModule { }