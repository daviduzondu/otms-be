import { IsBoolean } from 'class-validator';

export class RevokeTestDto {
  @IsBoolean()
  revoked: boolean;
}