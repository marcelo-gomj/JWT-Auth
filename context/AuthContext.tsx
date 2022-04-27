import { createContext, ReactNode } from 'react';
import { api } from '../services/api';
import { useState } from 'react';
import Router from 'next/router';


type SignInCredentails = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentails): Promise<void>;
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

export function AuthProvider({children}: AuthProviderProps){
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    async function signIn({email, password}: SignInCredentails){
        try{
            const response = await api.post('sessions', {
                email, 
                password
            })
    
            const { token, refreshToken, roles, permissions } = response.data;

            setUser({email, roles, permissions})

            Router.push('/dashboard');

        }catch (err){
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{signIn, isAuthenticated, user}}>
            { children }
        </AuthContext.Provider>
    )
}