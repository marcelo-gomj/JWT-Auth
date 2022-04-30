import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";

import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateRolesPermissions";

type withSSRAuthOptions = {
  permissions ?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: withSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext) : Promise<GetServerSidePropsResult<P>> => {
      const cookies = parseCookies(ctx);
      const token = cookies['jwt-auth.token']
    
      if(!token) {
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }

      const user = decode<{
        permissions: string[], 
        roles: string[]}
      >(token);
      
      if(options){
        const { permissions, roles } = options;

        const userHasValidatePermissions = validateUserPermissions({
            user,
            permissions,
            roles
        })


        if(!userHasValidatePermissions){
          return {
            redirect : {
              destination : 'dashboard',
              permanent: false
            }
          }
        }
      }
    
    try{
      return await fn(ctx);
    }catch(err){
      if(err instanceof AuthTokenError){
        destroyCookie(ctx, 'jwt-auth.token');
        destroyCookie(ctx,'jwt-auth.refreshToken' )

        return {
          redirect : {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}
