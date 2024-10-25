import { Module } from '@nestjs/common';

import { ActivitiesService } from '../activities/activities.service';
import { DynamicConfigService } from '../envs.service';
import { TokenService } from '../stravaOauth/token/token.service';
import { HealthcheckController } from './Healthcheck.controller';

@Module({
    imports: [],
    controllers: [HealthcheckController],
    providers: [TokenService, DynamicConfigService, ActivitiesService],
})
export class HealtcheckModule {}
