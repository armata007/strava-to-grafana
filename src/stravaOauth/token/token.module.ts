import { Module } from '@nestjs/common';

import { DynamicConfigService } from '../../envs.service';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
    imports: [],
    controllers: [TokenController],
    providers: [TokenService, DynamicConfigService],
})
export class TokenModule {}
