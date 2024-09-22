import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { ActivitiesService } from './activities.service';

@Controller()
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) {}

    @Get('activities/importAll')
    async importAllActivities(@Res() res: Response): Promise<Response | void> {
        try {
            await this.activitiesService.importAllWorkouts();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('ERROR', error);
            return res.redirect('/strava/token?redirectTo=activities-importAll');
        }
        return res.send('Done');
    }

    @Get('activities/importNew')
    async importNewActivities(@Res() res: Response): Promise<Response | void> {
        try {
            await this.activitiesService.importWorkoutsAfterLastInDb();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('ERROR', error);
            return res.redirect('/strava/token?redirectTo=activities-importNew');
        }
        return res.send('Done');
    }
}
