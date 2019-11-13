import axios from '@/axios/config';

export default {
    // 谷歌验证校验
    checkGoogleCode (params) {
        return axios.get('/validator/googleValidator/' + params.code);
    }
}
