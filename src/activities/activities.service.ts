import * as fsAll from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

import { DynamicConfigService } from '../envs.service';
import { TokenService } from '../stravaOauth/token/token.service';

const fs = fsAll.promises;

type Activity = {
    id: number;
};

type Workout = {
    strava_id: number;
    name: string;
    start_date: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    calories: number;
    sport_type: string;
    start_date_local: string;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    average_speed: number;
    max_speed: number;
    average_cadence: number;
    average_temp: number;
    average_watts: number;
    max_watts: number;
    weighted_average_watts: number;
    kilojoules: number;
    device_watts: boolean;
    has_heartrate: boolean;
    average_heartrate: number;
    max_heartrate: number;
    elev_high: number;
    elev_low: number;
    pr_count: number;
    suffer_score: number;
    external_id: string;
    device_name: string;
    description: string;
};

const isActivity = (activity: unknown): activity is Activity => {
    if (activity && typeof (activity as Activity).id === 'number') {
        return true;
    }
    return false;
};

@Injectable()
export class ActivitiesService {
    constructor(
        private envsService: DynamicConfigService,
        private tokenService: TokenService,
    ) {}

    private updateWorkoutsInDb = async (workouts: Workout[]): Promise<void> => {
        const prisma = new PrismaClient();
        for (let i = 0; i < workouts.length; i += 1) {
            await prisma.activity.upsert({
                where: {
                    strava_id: workouts[i].strava_id,
                },
                update: workouts[i],
                create: workouts[i],
            });
        }
    };

    private async getWorkouts(after?: number): Promise<Workout[]> {
        await this.tokenService.refreshToken();
        try {
            let page = 1;
            let allActivities: Activity[] = [];
            let fetchMore = true;
            while (fetchMore) {
                // eslint-disable-next-line no-console
                console.log(`Getting page ${page} of activities`);
                const response = await fetch(
                    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100${after > 0 ? `&after=${after}` : ''}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.envsService.get('ACCESS_TOKEN')}`,
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch activities: ${errorData.message}`);
                }

                const activities = await response.json();
                allActivities = allActivities.concat(activities);

                if (activities.length < 100) {
                    fetchMore = false;
                } else {
                    page += 1;
                }
            }

            const detailedDataPromises = allActivities.map(
                async (activity): Promise<Workout & { id: number }> => {
                    if (isActivity(activity)) {
                        const cachePath = path.join(
                            __dirname,
                            '..',
                            '..',
                            '.cache',
                            `${activity.id}.json`,
                        );
                        try {
                            const cachedData = await fs.readFile(cachePath, 'utf-8');
                            return JSON.parse(cachedData);
                        } catch {
                            // eslint-disable-next-line no-console
                            console.log(`Downloading activity ${activity.id}`);
                            const detailedResponse = await fetch(
                                `https://www.strava.com/api/v3/activities/${activity.id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${this.envsService.get('ACCESS_TOKEN')}`,
                                    },
                                },
                            );

                            if (!detailedResponse.ok) {
                                const errorData = await detailedResponse.json();
                                throw new Error(
                                    `Failed to fetch detailed activity: ${errorData.message}`,
                                );
                            }

                            const detailedData = await detailedResponse.json();
                            await fs.writeFile(cachePath, JSON.stringify(detailedData));
                            return detailedData;
                        }
                    }
                    return null;
                },
            );

            const detailedData = await Promise.all(detailedDataPromises);
            return detailedData.map((singleData) => ({
                strava_id: singleData.id,
                name: singleData.name,
                start_date: singleData.start_date,
                distance: singleData.distance,
                moving_time: singleData.moving_time,
                elapsed_time: singleData.elapsed_time,
                total_elevation_gain: singleData.total_elevation_gain,
                type: singleData.type,
                calories: singleData.calories,
                sport_type: singleData.sport_type,
                start_date_local: singleData.start_date_local,
                achievement_count: singleData.achievement_count,
                kudos_count: singleData.kudos_count,
                comment_count: singleData.comment_count,
                athlete_count: singleData.athlete_count,
                photo_count: singleData.photo_count,
                average_speed: singleData.average_speed,
                max_speed: singleData.max_speed,
                average_cadence: singleData.average_cadence,
                average_temp: singleData.average_temp,
                average_watts: singleData.average_watts,
                max_watts: singleData.max_watts,
                weighted_average_watts: singleData.weighted_average_watts,
                kilojoules: singleData.kilojoules,
                device_watts: singleData.device_watts,
                has_heartrate: singleData.has_heartrate,
                average_heartrate: singleData.average_heartrate,
                max_heartrate: singleData.max_heartrate,
                elev_high: singleData.elev_high,
                elev_low: singleData.elev_low,
                pr_count: singleData.pr_count,
                suffer_score: singleData.suffer_score,
                external_id: singleData.external_id,
                device_name: singleData.device_name,
                description: singleData.description,
            }));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    public importAllWorkouts = async (): Promise<void> => {
        await this.tokenService.refreshToken();
        const workouts = await this.getWorkouts();
        await this.updateWorkoutsInDb(workouts);
    };

    public importWorkoutsAfterLastInDb = async (): Promise<void> => {
        await this.tokenService.refreshToken();
        const prisma = new PrismaClient();
        const lastWorkout = await prisma.activity.findFirst({ orderBy: { start_date: 'desc' } });
        if (!lastWorkout) {
            await this.importAllWorkouts();
        } else {
            const workouts = await this.getWorkouts(
                lastWorkout.start_date.getTime() / 1000 - 24 * 60 * 60,
            );
            await this.updateWorkoutsInDb(workouts);
        }
    };

    @Cron(process.env.STRAVA_CRON_GET_FREQUENCY)
    async handleCron(): Promise<void> {
        await this.importWorkoutsAfterLastInDb();
    }
}
