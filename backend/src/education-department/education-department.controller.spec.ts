import { Test, TestingModule } from '@nestjs/testing';
import { EducationDepartmentController } from './education-department.controller';

describe('EducationDepartmentController', () => {
  let controller: EducationDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationDepartmentController],
    }).compile();

    controller = module.get<EducationDepartmentController>(EducationDepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
