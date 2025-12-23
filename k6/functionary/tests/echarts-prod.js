import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
    stages: [
        { duration: "1m", target: 100 },
        // { duration: "1m", target: 100 },
        { duration: "2m", target: 1 },
        { duration: "30s", target: 1 }
    ]
};


export default function () {

    const expedientsCourtRes = http.get( `https://nilo.cjj.gob.mx/js/libs/echarts.min.js` );
    check(expedientsCourtRes, {
        'Firma response OK': (r) => r.status === 200
    });

}
