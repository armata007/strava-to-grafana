import { Module } from '@nestjs/common';

import { HealthcheckController } from './Healthcheck.controller';

@Module({
    imports: [],
    controllers: [HealthcheckController],
    providers: [],
})
export class HealtcheckModule {}
