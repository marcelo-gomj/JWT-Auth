import axios, { AxiosError } from 'axios';
import { parseCookies } from 'nookies';

let cookies = parseCookies();

export const api =  axios.create({
    baseURL: 'http://localhost:3333', 
    headers: {
        Authorization: `Bearer ${cookies['jwt-auth.token']}`
    }
});

api.interceptors.response.use(response => {
    return response
}, (error: AxiosError) => {
    if(error.response.status === 401){
        if(error.response.data?.code === 'token.expired'){
            cookies = parseCookies();

            const { 'jwt-auth.refreshToken': refreshToken } = cookies;
            

        }else{

        }
    }
})