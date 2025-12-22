import { Module } from "@nestjs/common";
import { CategoryController } from "./controllers/category.controller";
import { CategoryUseCase } from "./usecases/category.usecase";
import { CategoryRepository } from "./repositories/category.repository";

@Module({
  controllers: [CategoryController],
  providers: [CategoryUseCase, CategoryRepository],
})
export class CategoryModule {}
