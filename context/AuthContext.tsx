import { createContext, ReactNode, useEffect, useState } from 'react';
import Router from 'next/router';

import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { api } from '../services/apiClient';

type SignInCredentails = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn : (credentials: SignInCredentails) => Promise<void>;
    signOut : () => void;
    isAuthenticated: boolean;
    user: User
}
 
type AuthProviderProps = {
    children : ReactNode;
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

export const AuthContext = createContext({} as AuthContextData);

const authChannel = new BroadcastChannel('auth');


export function signOut(){
    destroyCookie(undefined, 'jwt-auth.token');
    destroyCookie(undefined, 'jwt-auth.refreshToken');

    authChannel.postMessage('SignOut');

    Router.push('/');
}

export function AuthProvider({children}: AuthProviderProps){
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    useEffect(()=> {
        const { "jwt-auth.token" : token } = parseCookies(); 

        if(token){
            api.get('/me')
            .then( response => {
                const { email, permissions, roles } = response.data;

                setUser({ email, permissions, roles })
            }).catch(() => {
                signOut();
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentails){
        try{
            const response = await api.post('sessions', {
                email, 
                password
            });
    
            const { token, refreshToken, roles, permissions } = response.data;
            
            setCookie(undefined, 'jwt-auth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            });

            setCookie(undefined,  'jwt-auth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            });
            
            setUser({ email, roles, permissions });

            api.defaults.headers["Authorization"] = `Bearer ${token}`;

            Router.push('/dashboard');

        }catch (err){
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{signIn, signOut, isAuthenticated, user}}>
            { children }
        </AuthContext.Provider>
    )
}