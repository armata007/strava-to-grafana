import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamicConfigService {
    private config: Record<string, string> = {};

    constructor() {
        this.loadEnvFiles();
    }

    loadEnvFiles(): void {
        const envFiles = ['.env', '.env.generated'];

        envFiles.forEach((path) => {
            if (fs.existsSync(path)) {
                const envConfig = dotenv.parse(fs.readFileSync(path));
                this.config = { ...this.config, ...envConfig };
            }
        });
    }

    get(key: string): string | undefined {
        this.reloadEnvFiles();
        return this.config[key];
    }

    reloadEnvFiles(): void {
        this.loadEnvFiles();
    }
}
