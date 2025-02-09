import * as fsAll from 'fs';
import * as path from 'path';
import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { ActivitiesService } from '../activities/activities.service';
import { DynamicConfigService } from '../envs.service';
import { TokenService } from '../stravaOauth/token/token.service';

@Controller('healthcheck')
export class HealthcheckController {
    constructor(
        private readonly activitiesService: ActivitiesService,
        private tokenService: TokenService,
        private envsService: DynamicConfigService,
    ) {}

    @Get()
    async healthcheck(): Promise<{
        dbConnection: boolean;
        activities: number;
        statusCode: 200;
        strava: boolean;
        numberOfFilesInCache: number;
    }> {
        const prisma = new PrismaClient();
        try {
            await prisma.$connect();
        } catch (error) {
            throw new InternalServerErrorException(`Database connection error - ${error}`);
        }

        const activities = await prisma.activity.count();

        try {
            await this.tokenService.refreshToken();
            const strava = await this.activitiesService.fetchStravaApi({ perPage: 1, page: 1 });
            if (!strava.ok || strava.status !== 200) {
                throw new Error(`Strava error. Status: ${strava.status}. OK: ${strava.ok}`);
            }
        } catch (error) {
            throw new InternalServerErrorException(`Strava error - ${error}`);
        }

        let numberOfFilesInCache = 0;

        try {
            const cachePath = path.join(
                __dirname,
                '..',
                '..',
                this.envsService.get('STRAVA_ACTIVITIES_CACHE_FOLDER'),
            );
            const files = await fsAll.promises.readdir(cachePath);
            numberOfFilesInCache = files.length;
        } catch (error) {
            throw new InternalServerErrorException(`Number of files in cache error - ${error}`);
        }

        return {
            dbConnection: true,
            activities,
            statusCode: 200,
            strava: true,
            numberOfFilesInCache,
        };
    }
}
