export K6_INFLUXDB_USERNAME=k6-agil-gob
export K6_INFLUXDB_PASSWORD=k6-agil-gob
export K6_INFLUXDB_ADDR=http://influxdb:8086
export K6_INFLUXDB_DATABASE=k6 


export STRATEGY=average
# export VU=10
# export TIME=60s
export TAG=M1


# export ENVIRONMENT=opti
# export K6_WEB_DASHBOARD=true
# export K6_WEB_DASHBOARD_EXPORT="tmp/Report_${ENVIRONMENT}_${STRATEGY}_${TAG}.html"

# k6 run \
#   --out influxdb=http://localhost:8086/k6 \
#   --tag environment=$ENVIRONMENT \
#   --tag strategy=$STRATEGY \
#   --tag run=${TAG} \
#   k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${TAG}.log



export ENVIRONMENT=sandbox
export K6_WEB_DASHBOARD=true
export K6_WEB_DASHBOARD_EXPORT="tmp/Report_${ENVIRONMENT}_${STRATEGY}_${TAG}.html"

k6 run \
  --out influxdb=http://localhost:8086/k6 \
  --tag environment=$ENVIRONMENT \
  --tag strategy=$STRATEGY \
  --tag run=${TAG} \
  k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${TAG}.log



# export K6_INFLUXDB_USERNAME=k6-agil-gob
# export K6_INFLUXDB_PASSWORD=k6-agil-gob
# export K6_INFLUXDB_ADDR=http://influxdb:8086
# export K6_INFLUXDB_DATABASE=k6 


# export STRATEGY=average
# export TAG="L3_OPTI_PROD"


# export ENVIRONMENT=production
# export APPLICATION=opti
# export K6_WEB_DASHBOARD=true
# export K6_WEB_DASHBOARD_EXPORT="tmp/Report_${ENVIRONMENT}_${APPLICATION}_${STRATEGY}_${TAG}.html"

# k6 run \
#   --out influxdb=http://localhost:8086/k6 \
#   --tag environment=$ENVIRONMENT \
#   --tag strategy=$STRATEGY \
#   --tag run=${TAG} \
#   k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${APPLICATION}_${TAG}.log



# export TAG="L3_PROD_PROD"
# export ENVIRONMENT=production
# export APPLICATION=functionary
# export K6_WEB_DASHBOARD=true
# export K6_WEB_DASHBOARD_EXPORT="tmp/Report_${ENVIRONMENT}_${APPLICATION}_${STRATEGY}_${TAG}.html"

# k6 run \
#   --out influxdb=http://localhost:8086/k6 \
#   --tag environment=$ENVIRONMENT \
#   --tag strategy=$STRATEGY \
#   --tag run=${TAG} \
#   k6/functionary/tests/front-functionary.js >> tmp/run_${ENVIRONMENT}_${STRATEGY}_${APPLICATION}_${TAG}.log