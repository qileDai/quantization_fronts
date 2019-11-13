import axios from '@/axios/config';

export default {
    // 获取报表统计
    getFinancialList (params) {
        return axios({
            method: 'get',
            url: '/financialStatements',
            params: params
        });
    },
    // 导出Excel报表
    exportReportList (data) {
        return axios({
            headers: {'filename': 'utf-8'},
            method: 'post',
            url: '/financialStatements/downLoadExcel',
            data: data,
            responseType: 'arraybuffer'
        });
    }
}
