import axios from 'axios';
import qs from 'qs';
import type { AxiosRequestConfig } from 'axios';


axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 10000;



function getToken() {

    var data = qs.stringify({
        'grant_type': 'client_credentials',
        'client_secret': '',
        'client_id': ''
    });
    var config = {
        method: 'post',
        url: 'https://pfetst.service-now.com/oauth_token.do',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Accept': '*/*',
            'Host': 'pfetst.service-now.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'BIGipServerpool_pfetst=f0dec4b40e6aa7fbbc9afd1ff3c1126c; JSESSIONID=21FE46F18B3B2CB9BEE6B65627B31BB5; glide_user_route=glide.d0fc93c4f352848effe4484033009e26; glide_node_id_for_js=e6f59d33e0883d67227073aa3a3cbc2e7bd32189de853ba0c0e2eeb478fb7e28'
        },
        data: data
    } satisfies AxiosRequestConfig;

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

}