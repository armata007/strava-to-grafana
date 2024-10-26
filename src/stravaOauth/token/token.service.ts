import { Injectable } from '@nestjs/common';

import { isAccessTokenObject, isErrorObject, saveTokensToFile } from '../../helpers';

import { DynamicConfigService } from '../../envs.service';

const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth/';
const getStravaUrl = (url: string): string => `${STRAVA_OAUTH_URL}${url}`;

@Injectable()
export class TokenService {
    constructor(private envsService: DynamicConfigService) {}

    public getToken = async (authorizationCode: string): Promise<string> => {
        try {
            const response = await fetch(getStravaUrl('token'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: this.envsService.get('STRAVA_CLIENT_ID'),
                    client_secret: this.envsService.get('STRAVA_CLIENT_SECRET'),
                    code: authorizationCode,
                    grant_type: 'authorization_code',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (isErrorObject(errorData)) {
                    throw new Error(`Failed to get access token: ${errorData.message}`);
                }
            }

            const data = await response.json();
            if (isAccessTokenObject(data)) {
                await saveTokensToFile(data);
                this.envsService.reloadEnvFiles();
                return data.access_token;
            }
            return 'UNKNOWN';
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting access token:', error);
            throw error;
        }
    };

    public refreshToken = async (): Promise<void> => {
        // eslint-disable-next-line no-console
        console.log('Refreshing token');
        if (!this.envsService.get('ACCESS_TOKEN') || !this.envsService.get('REFRESH_TOKEN')) {
            throw new Error('Run yarn run getToken first');
        }
        const CURRENT_DATE = Date.now() / 1000;
        // eslint-disable-next-line no-console
        console.log(`EXPIRES_AT: ${this.envsService.get('EXPIRES_AT')}, Date: ${CURRENT_DATE}`);
        if (Number(this.envsService.get('EXPIRES_AT')) >= CURRENT_DATE) {
            // eslint-disable-next-line no-console
            console.log('Token refresh not necessary');
        } else {
            // eslint-disable-next-line no-console
            console.log('Token refresh necessary');
            try {
                const response = await fetch(getStravaUrl('token'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: this.envsService.get('STRAVA_CLIENT_ID'),
                        client_secret: this.envsService.get('STRAVA_CLIENT_SECRET'),
                        refresh_token: this.envsService.get('REFRESH_TOKEN'),
                        grant_type: 'refresh_token',
                    }),
                });

                if (!response.ok) {
                    // eslint-disable-next-line no-console
                    console.log(response);
                    throw new Error('Failed to get access token');
                }

                const data = await response.json();
                if (isAccessTokenObject(data)) {
                    await saveTokensToFile(data);
                    this.envsService.reloadEnvFiles();
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error getting access token:', error);
                throw error;
            }
        }
    };

    getRedirect(redirectTo?: string): { url: string } {
        const redirectUri = `http://${this.envsService.get('APP_DOMAIN')}:${this.envsService.get('APP_PORT')}/strava-callback`;
        const stravaAuthUrl = getStravaUrl(
            `authorize?client_id=${this.envsService.get('STRAVA_CLIENT_ID')}&response_type=code&redirect_uri=${redirectUri}${redirectTo ? `?redirectTo=${redirectTo}` : ''}&approval_prompt=force&scope=read,activity:read_all`,
        );
        return { url: stravaAuthUrl };
    }
}
