import { Controller, Get, Query, Redirect } from '@nestjs/common';

import { StravaTokenDto } from './token.dto';
import { TokenService } from './token.service';

@Controller()
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Get('strava/token')
    @Redirect()
    getToken(@Query() query: StravaTokenDto): { url: string } {
        return this.tokenService.getRedirect(query.redirectTo);
    }
}
