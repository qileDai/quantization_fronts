import axios from '@/axios/config';

export default {
    // 获取
    getApps (params) {
        return axios.get('/apps');
    },
    // 提交
    addApp (params) {
        return axios.post('/apps', params);
    },
    // 编辑
    editApp (params) {
        return axios.put('/apps', params);
    },
    // 删除
    deleteApp (params) {
        return axios.delete('/apps/' + params.id);
    }
}
