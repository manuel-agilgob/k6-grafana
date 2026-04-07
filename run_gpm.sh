
#!/bin/bash
set -e

files=(
    "chart-procedures-by-group"
    "stats-chart"
    "chart-stage"
    "procedures-status"
    "users-datatable"
    "chart-users"
    "processes-catalogs-datatable"
    "holidays-datatable"
    "processes-datatable"
)
envs=(
    ".env.pre"
    ".env.pos"
)

for env in "${envs[@]}"; do
    # Deriva el prefijo del nombre del archivo .env (ej: .env.pre -> PRE, .env.pos -> POS)
    prefix=$(basename "$env" | sed 's/\.env\.//' | tr '[:lower:]' '[:upper:]')

    for file in "${files[@]}"; do
        echo "Running [$prefix] $file"
        npx dotenvx run -f "$env" -- k6 run \
            --env K6_WEB_DASHBOARD=true \
            --env K6_WEB_DASHBOARD_EXPORT=".tmp/${prefix}-${file}.html" \
            "src/tests/gpm/$file.test.js"
    done
done
