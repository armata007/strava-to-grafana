import { IsOptional, IsString } from 'class-validator';

export class StravaCallbackDto {
    @IsString()
    public code: string;

    @IsOptional()
    @IsString()
    public redirectTo?: string;
}
