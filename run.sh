export K6_INFLUXDB_USERNAME=k6-agil-gob
export K6_INFLUXDB_PASSWORD=k6-agil-gob
export K6_INFLUXDB_ADDR=http://influxdb:8086
export K6_INFLUXDB_DATABASE=k6 


export STRATEGY=average
export TAG="2025-12-19-Wait1"




# k6 run \
#   --out influxdb=http://localhost:8086/k6 \
#   --tag environment=$ENVIRONMENT \
#   --tag strategy=$STRATEGY \
#   --tag run=${TAG} \
#   k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${TAG}.log



export ENVIRONMENT=production
export K6_WEB_DASHBOARD=true
export K6_WEB_DASHBOARD_EXPORT="tmp/Report_${ENVIRONMENT}_${STRATEGY}_${TAG}.html"

k6 run \
  k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${TAG}.log
#   # --out influxdb=http://localhost:8086/k6 \
#   # --tag environment=$ENVIRONMENT \
#   # --tag strategy=$STRATEGY \
#   # --tag run=${TAG} \


# export K6_WEB_DASHBOARD=true
# export K6_WEB_DASHBOARD_PERIOD=2s
# export K6_WEB_DASHBOARD_EXPORT="tmp/Report_Sandbox_Echart.html"
# k6 run ./k6/functionary/tests/echarts-sandbox.js > "tmp/Report_Sandbox_Echart.log"

# sleep 60
# export K6_WEB_DASHBOARD_EXPORT="tmp/Report_Productivo_Echart.html"
# k6 run ./k6/functionary/tests/echarts-prod.js > "tmp/Report_Productivo_Echart.log"