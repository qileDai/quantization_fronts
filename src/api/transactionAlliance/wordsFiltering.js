import axios from '@/axios/config';

export default {
    // 获取列表
    getWordsList (params) {
        return axios.get('/sensitivefilter/getListByPage', {params});
    },
    // 添加词语
    doAddWord (params) {
        return axios.post('/sensitivefilter/save', params);
    },
    // 删除词语
    doDeleteWord (params) {
        return axios.delete('/sensitivefilter/delete', {params});
    },
    // 获取列表(前缀)
    getWordsListPrefix (params) {
        return axios.get('/prefix/getListByPage', {params});
    },
    // 添加词语(前缀)
    doAddWordPrefix (params) {
        return axios.post('/prefix/save', params);
    },
    // 删除词语(前缀)
    doDeleteWordPrefix (params) {
        return axios.delete('/prefix/delete', {params});
    }
}
