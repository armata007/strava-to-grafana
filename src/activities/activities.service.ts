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
    workout_type: number | null;
    trainer?: boolean;
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

    public async fetchStravaApi({
        after,
        perPage = 100,
        page,
    }: {
        after?: number;
        perPage?: number;
        page: number;
    }): Promise<Response> {
        return fetch(
            `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}${after > 0 ? `&after=${after}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${this.envsService.get('ACCESS_TOKEN')}`,
                },
            },
        );
    }

    private async getWorkouts({
        after,
        perPage = 100,
    }: {
        after?: number;
        perPage?: number;
    }): Promise<{ workouts: Workout[]; finished: boolean }> {
        await this.tokenService.refreshToken();
        const data: Workout[] = [];
        try {
            let page = 1;
            let fetchMore = true;
            while (fetchMore) {
                // eslint-disable-next-line no-console
                console.log(`Getting page ${page} of activities`);
                const response = await this.fetchStravaApi({ after, perPage, page });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch activities: ${errorData.message}`);
                }

                const activities = await response.json();

                for (let i = 0; i < activities.length; i += 1) {
                    const activity = activities[i];
                    if (isActivity(activity)) {
                        let activityData: (Workout & { id: number }) | null = null;
                        const cachePath = path.join(
                            __dirname,
                            '..',
                            '..',
                            this.envsService.get('STRAVA_ACTIVITIES_CACHE_FOLDER'),
                            `${activity.id}.json`,
                        );
                        try {
                            const cachedData = await fs.readFile(cachePath, 'utf-8');
                            activityData = JSON.parse(cachedData);
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.log(error);
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
                            activityData = detailedData;
                        }

                        data.push({
                            strava_id: activityData.id,
                            name: activityData.name,
                            start_date: activityData.start_date,
                            distance: activityData.distance,
                            moving_time: activityData.moving_time,
                            elapsed_time: activityData.elapsed_time,
                            total_elevation_gain: activityData.total_elevation_gain,
                            type: activityData.type,
                            calories: activityData.calories,
                            sport_type: activityData.sport_type,
                            start_date_local: activityData.start_date_local,
                            achievement_count: activityData.achievement_count,
                            kudos_count: activityData.kudos_count,
                            comment_count: activityData.comment_count,
                            athlete_count: activityData.athlete_count,
                            photo_count: activityData.photo_count,
                            average_speed: activityData.average_speed,
                            max_speed: activityData.max_speed,
                            average_cadence: activityData.average_cadence,
                            average_temp: activityData.average_temp,
                            average_watts: activityData.average_watts,
                            max_watts: activityData.max_watts,
                            weighted_average_watts: activityData.weighted_average_watts,
                            kilojoules: activityData.kilojoules,
                            device_watts: activityData.device_watts,
                            has_heartrate: activityData.has_heartrate,
                            average_heartrate: activityData.average_heartrate,
                            max_heartrate: activityData.max_heartrate,
                            elev_high: activityData.elev_high,
                            elev_low: activityData.elev_low,
                            pr_count: activityData.pr_count,
                            suffer_score: activityData.suffer_score,
                            external_id: activityData.external_id,
                            device_name: activityData.device_name,
                            description: activityData.description,
                            workout_type: activityData.workout_type || null,
                            trainer: activityData.trainer || false,
                        });
                    }
                }

                if (activities.length < 100) {
                    fetchMore = false;
                } else {
                    page += 1;
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching activities:', error);
            return { workouts: data, finished: false };
        }
        return { workouts: data, finished: true };
    }

    public importAllWorkouts = async (): Promise<boolean> => {
        await this.tokenService.refreshToken();
        const { workouts, finished } = await this.getWorkouts({});
        await this.updateWorkoutsInDb(workouts);
        return finished;
    };

    public importWorkoutsAfterLastInDb = async (): Promise<boolean> => {
        await this.tokenService.refreshToken();
        const prisma = new PrismaClient();
        const lastWorkout = await prisma.activity.findFirst({ orderBy: { start_date: 'desc' } });
        if (!lastWorkout) {
            const finished = await this.importAllWorkouts();
            return finished;
        }
        const { workouts, finished } = await this.getWorkouts({
            after: lastWorkout.start_date.getTime() / 1000 - 24 * 60 * 60,
        });
        await this.updateWorkoutsInDb(workouts);
        return finished;
    };

    @Cron(process.env.STRAVA_CRON_GET_FREQUENCY)
    async handleCron(): Promise<void> {
        await this.importWorkoutsAfterLastInDb();
    }
}
