import { Module } from '@nestjs/common';

import { DynamicConfigService } from '../../envs.service';
import { TokenService } from '../token/token.service';
import { CallbackController } from './callback.controller';
import { CallbackService } from './callback.service';

@Module({
    imports: [],
    controllers: [CallbackController],
    providers: [CallbackService, TokenService, DynamicConfigService],
})
export class CallbackModule {}
