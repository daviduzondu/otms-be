import { Test, TestingModule } from '@nestjs/testing';
import { BrandingController } from './branding.controller';

describe('BrandingController', () => {
  let controller: BrandingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandingController],
    }).compile();

    controller = module.get<BrandingController>(BrandingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
