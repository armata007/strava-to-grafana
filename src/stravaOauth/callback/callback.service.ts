import { Injectable } from '@nestjs/common';

import { TokenService } from '../token/token.service';

@Injectable()
export class CallbackService {
    constructor(private tokensService: TokenService) {}

    async getAccessToken(authorizationCode: string): Promise<string> {
        try {
            await this.tokensService.getToken(authorizationCode);
            return 'Access token successfully saved';
        } catch (error) {
            return `Error getting access token ${error.message}`;
        }
    }
}
