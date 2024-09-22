import { Controller, Get, Query, Redirect } from '@nestjs/common';

import { StravaCallbackDto } from './callback.dto';
import { CallbackService } from './callback.service';

@Controller()
export class CallbackController {
    constructor(private readonly callbackService: CallbackService) {}

    @Get('strava-callback')
    @Redirect('/')
    // eslint-disable-next-line consistent-return
    async getHello(@Query() query: StravaCallbackDto): Promise<{ url: string }> {
        await this.callbackService.getAccessToken(query.code);
        if (query.redirectTo) {
            return { url: query.redirectTo.replace(/-/g, '/') };
        }
    }
}
