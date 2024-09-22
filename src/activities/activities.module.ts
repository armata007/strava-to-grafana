import { Module } from '@nestjs/common';

import { DynamicConfigService } from '../envs.service';
import { TokenService } from '../stravaOauth/token/token.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

@Module({
    imports: [],
    controllers: [ActivitiesController],
    providers: [TokenService, DynamicConfigService, ActivitiesService],
})
export class ActivitiesModule {}
