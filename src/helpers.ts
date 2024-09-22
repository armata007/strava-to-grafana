import * as fsAll from 'fs';
import * as path from 'path';

const fs = fsAll.promises;

export type AccessTokenObject = { access_token: string; refresh_token: string; expires_at: number };

export const isAccessTokenObject = (data: unknown): data is AccessTokenObject => {
    if (data && typeof (data as AccessTokenObject).access_token !== 'undefined') {
        return true;
    }
    return false;
};

export const saveTokensToFile = async (data: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}): Promise<void> => {
    await fs.writeFile(
        path.join(__dirname, '..', '.env.generated'),
        `ACCESS_TOKEN="${data.access_token}"
REFRESH_TOKEN="${data.refresh_token}"
EXPIRES_AT="${data.expires_at}"`,
    );
};

type ErrorObject = { message: string };

export const isErrorObject = (errorData: unknown): errorData is ErrorObject => {
    if (errorData && typeof (errorData as ErrorObject).message !== 'undefined') {
        return true;
    }
    return false;
};
