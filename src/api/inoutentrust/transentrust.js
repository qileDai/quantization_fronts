import axios from '@/axios/config';

export default {
    extractExportExcel (params) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'POST',
            url: '/entrust/transRecord/exportTransRecord',
            data: params,
            responseType: 'arraybuffer'
        });
    }
}