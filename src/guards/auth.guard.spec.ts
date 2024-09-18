import { JwtAuthGuard } from './auth.guard';

describe('GuardsGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
