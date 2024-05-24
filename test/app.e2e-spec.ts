import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MemberController } from '../src/member/member.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.setTimeout(30000); // 타임아웃을 30초로 설정
    console.log('Setting up the test module...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    console.log('Initializing the app...');
    await app.init();
    console.log('App initialized');
  });

  it('/ (GET)', async () => {
    console.log('start /')
    return await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/member (회원가입)', async () => {
    console.log('start /member')
    return await request(app.getHttpServer())
      .post('/member')
      .send({
        "useremail": "jjang6251@gmail.com",
        "password": "1234",
        "usertype": "예비 창업자",
        "name": "장성원",
        "nickname": "만리장성"
      })
      .expect(201)
      .expect(res => {
        expect(res.body).toStrictEqual({
          "statusCode": 201,
          "message": "회원가입 완료"
        })
      })
  })

  // afterAll(async () => {
  //   await app.close();
  // });

});
