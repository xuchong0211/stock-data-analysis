import { SessionProvider, useSession } from "next-auth/react";
import NProgress from "nprogress";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "antd/dist/antd.css";
import "nprogress/nprogress.css";
import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";

function useShowRouteLoading(router: NextRouter) {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const onStart = (url: string) => {
      console.log(`App is changing to ${url} `);
      NProgress.start();
    };
    const onComplete = (url: string) => {
      console.log(`App completed changing to ${url} `);
      NProgress.done();
    };
    const onError = (url: string) => {
      console.log(`App errored changing to ${url} `);
      NProgress.done();
    };

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError", onError);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError", onError);
    };
  }, [router]);
}
function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useShowRouteLoading(router);

  return (
    <SessionProvider session={pageProps.session}>
      {Component.noauth ? (
        <Component {...pageProps} />
      ) : (
        <Auth>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Auth>
      )}
    </SessionProvider>
  );
}

function Auth({ children }) {
  const { data: session, status } = useSession({ required: true });
  const isUser = !!session?.user;

  if (isUser) {
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}

export default App;
