import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {

    return async (ctx: GetServerSidePropsContext) : Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);
        const hasCookie = cookies['jwt-auth.token']
      
        if(!hasCookie) {
          return {
            redirect: {
              destination: '/',
              permanent: false
            }
          }
        }

          return await fn(ctx);
    }
}
