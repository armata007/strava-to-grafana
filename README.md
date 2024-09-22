# Strava to Grafana app

## TODO before pushing:

-   refactor downloading all workouts (from 0)
-   typecheck
-   gh actions
-   husky

## TODO

-   Add setup guide to readme (strava tokens, how to run in docker etc)
-   Add info, description etc to readme
-   Add more graphs (per activity type like km run/cycled etc)
-   Add maps and polylines feature
-   Add to healthcheck: grafana, last strava activity etc statuses which can be later used in other service to check if its alive
-   It might be possible to have a failure in crontab with strava api which would require reauth using some regular clicking - add to healthcheck when it first occurs
-   Change main data from "Hello world" to something else
-   init.sql - can we have value from env there?