import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('healthcheck')
export class HealthcheckController {
    constructor() {}

    @Get()
    async healthcheck(): Promise<{
        dbConnection: boolean;
        activities: number;
        statusCode: 200;
    }> {
        const prisma = new PrismaClient();
        try {
            await prisma.$connect();
        } catch {
            throw new InternalServerErrorException('Database connection error');
        }

        const activities = await prisma.activity.count();

        return {
            dbConnection: true,
            activities,
            statusCode: 200,
        };
    }
}
