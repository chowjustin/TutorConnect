import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateStudentDto } from './dto/update-student.dto';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockService = {
    getProfile: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockService }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return the student profile', async () => {
      const mockProfile = { user: { email: 'test@test.com' }, profile: {} };
      mockService.getProfile.mockResolvedValue(mockProfile);

      const req = { user: { email: 'test@test.com' } };
      const result = await controller.getMyProfile(req);

      expect(result).toBe(mockProfile);
      expect(mockService.getProfile).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw if profile not found', async () => {
      mockService.getProfile.mockRejectedValue(new NotFoundException());
      const req = { user: { email: 'noone@test.com' } };

      await expect(controller.getMyProfile(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update student profile', async () => {
      const mockUpdate = { id: 's1', bio: 'new bio', user: {} };
      mockService.update.mockResolvedValue(mockUpdate);

      const dto: UpdateStudentDto = { bio: 'new bio', school: 'ABC', interests: ['MATH'] };
      const result = await controller.updateProfile('s1', dto);

      expect(result).toBe(mockUpdate);
      expect(mockService.update).toHaveBeenCalledWith('s1', dto);
    });
  });

});
