import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ActivitiesModule } from '../activities/activities.module';
import { ActivitiesService } from '../activities/activities.service';
import { DynamicConfigService } from '../envs.service';
import { HealtcheckModule } from '../healthcheck/Healthcheck.module';
import { CallbackModule } from '../stravaOauth/callback/callback.module';
import { TokenModule } from '../stravaOauth/token/token.module';
import { TokenService } from '../stravaOauth/token/token.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TokenModule,
        CallbackModule,
        ActivitiesModule,
        HealtcheckModule,
    ],
    controllers: [AppController],
    providers: [AppService, ActivitiesService, DynamicConfigService, TokenService],
})
export class AppModule {}
