import { Module } from "@nestjs/common";
import { ExampleController } from "./controllers/example.controller";
import { ExampleUseCase } from "./usecases/example.usecase";
import { ExampleRepository } from "./repositories/example.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ExampleController],
  providers: [ExampleUseCase, ExampleRepository],
})
export class ExampleModule {}
