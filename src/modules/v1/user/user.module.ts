import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserUseCase } from "./usecases/user.usecase";
import { UserRepository } from "./repositories/user.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserUseCase, UserRepository],
})
export class UserModule {}