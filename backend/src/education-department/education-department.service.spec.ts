import { Test, TestingModule } from '@nestjs/testing';
import { EducationDepartmentService } from './education-department.service';

describe('EducationDepartmentService', () => {
  let service: EducationDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducationDepartmentService],
    }).compile();

    service = module.get<EducationDepartmentService>(EducationDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
