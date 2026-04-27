
#!/bin/bash
set -e

npx dotenvx run -f .env.prod -- k6 run \
    --env K6_WEB_DASHBOARD=true \
    --env K6_WEB_DASHBOARD_EXPORT=".tmp/Funcionario_15m_75u_Abr24_1st.html" \
    --out json=.tmp/ExecAbr24_1st.json \
    "src/tests/functionary/expedients-by-court.js"
 