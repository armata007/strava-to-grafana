FROM grafana/grafana:11.2.0

ENV GF_ANALYTICS_REPORTING_ENABLED=false \
    GF_AUTH_ANONYMOUS_ENABLED=false \
    GF_DEFAULT_LOCALE=en-US \
    GF_AUTH_BASIC_ENABLED=false \
    GF_SECURITY_ALLOW_EMBEDDING=true \
    GF_SECURITY_DISABLE_GRAVATAR=true \
    GF_USERS_ALLOW_SIGN_UP=false \
    GF_DATE_FORMATS_USE_BROWSER_LOCALE=false \
    DATABASE_PORT=5432 \
    DATABASE_SSL_MODE=disable

USER grafana

COPY grafana/datasource.yml /etc/grafana/provisioning/datasources/
COPY grafana/dashboards.yml /etc/grafana/provisioning/dashboards/
COPY grafana/dashboards/*.json /dashboards/

EXPOSE 3000
