import { Module } from '@nestjs/common';
import { AuthModule } from './modules/v1/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
