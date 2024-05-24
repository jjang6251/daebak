import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberController } from './member/member.controller';
import { MemberModule } from './member/member.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Member } from './member/entities/member.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.development.env' : '.test.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const logger = new Logger('TypeORM'); // Logger 인스턴스 생성
        const options: TypeOrmModuleOptions = {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [Member],
          synchronize: configService.get<string>('SYNCHRONIZE') === 'true',
          dropSchema: configService.get<string>('DROPSCHEMA') === 'true',
          // dropSchema: false
        };

        // 설정 값을 로그로 출력합니다.
        logger.log(`TypeORM Options: ${JSON.stringify(options)}`);

        return options;
      },
      dataSourceFactory: async (options: TypeOrmModuleOptions): Promise<DataSource> => {
        const dataSource = new DataSource(options as DataSourceOptions);
        await dataSource.initialize();
        return dataSource;
      },
    }),
    MemberModule,
    AuthModule,
  ],
  controllers: [AppController, MemberController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
