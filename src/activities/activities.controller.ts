import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { ActivitiesService } from './activities.service';

@Controller()
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) {}

    @Get('activities/importAll')
    async importAllActivities(@Res() res: Response): Promise<Response | void> {
        try {
            const finished = await this.activitiesService.importAllWorkouts();
            if (!finished) {
                res.send(
                    'Done, but there are still more activities left to import. Run this again in 15 minutes.',
                );
            }
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
            const finished = await this.activitiesService.importWorkoutsAfterLastInDb();
            if (!finished) {
                res.send(
                    'Done, but there are still more activities left to import. Run this again in 15 minutes.',
                );
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('ERROR', error);
            return res.redirect('/strava/token?redirectTo=activities-importNew');
        }
        return res.send('Done');
    }
}
