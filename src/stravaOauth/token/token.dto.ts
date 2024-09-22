import { IsOptional, IsString } from 'class-validator';

export class StravaTokenDto {
    @IsOptional()
    @IsString()
    public redirectTo?: string;
}
