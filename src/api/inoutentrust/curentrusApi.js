import axios from '@/axios/config';

export default {
    extractExportExcel (params) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'POST',
            url: '/entrust/currentRecord/exportEntrustRecord',
            data: params,
            responseType: 'arraybuffer'
        });
    },
    setTime () {
        let year = new Date().getFullYear();
        let month =new Date().getMonth() + 1 < 10? "0" + (new Date().getMonth() + 1): new Date().getMonth() + 1;
        let date =new Date().getDate() < 10? "0" + new Date().getDate(): new Date().getDate();
        let time = year + "-" + month + "-" + date +" ";
        return time
    },
    setStartTime () {
        let time = setTime() + '00:00:00'
        return time
    },
    setEndTime () {
        let time = setTime() + '23:59:59'
        return time
    }
}