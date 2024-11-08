import { Inject } from '@nestjs/common';
import { CONNECTION } from '../../../constants/tokens';

export const InjectKysesly = () => Inject(CONNECTION);
