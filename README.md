# Strava to Grafana app

## TODO

-   Add setup guide to readme (strava tokens, how to run in docker etc)
-   Add info, description etc to readme
-   Add more graphs (per activity type like km run/cycled etc)
-   Add maps and polylines feature
-   Add to healthcheck: grafana, last strava activity etc statuses which can be later used in other service to check if its alive
-   It might be possible to have a failure in crontab with strava api which would require reauth using some regular clicking - add to healthcheck when it first occurs
-   Change main data from "Hello world" to something else
-   init.sql - can we have value from env there?
-   dashboard for activities (without calories as well)
-   some text to dashboard - is it possible?

## Healthchecks

Two app endpoints:

-   `GET /healthcheck/live` - liveness. Process-only, no external calls, safe to poll often.
-   `GET /healthcheck` - readiness/deep. Checks DB, refreshes the Strava token and hits the Strava
    API, counts cached files. Throws 500 on the first failing check. Hits the Strava rate limit if
    polled aggressively, so don't wire it into automated polling.

Every container reports health to Docker (`docker compose ps` shows the status):

-   `web` - node fetch against `/healthcheck/live`
-   `db` - `mysqladmin ping`
-   `grafana` - `/api/health`
-   `prisma-studio` - node fetch against `/`, which stays 200 even when the DB is down

`web` and `prisma-studio` wait for `db` to be healthy before starting.

## Init

1. clone repository
2. mkdir .cache (in env)
3. mkdir .grafana
4. mkdir .mysql
5. Make sure those dirs have proper permissions
6. cp .env.example .env and change values
7. touch .env.generated
8. docker-compose up --build
9. importAll
