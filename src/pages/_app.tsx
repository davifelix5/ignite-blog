import { AppProps } from 'next/app';
import '../styles/globals.scss';
import { ToastContainer } from 'react-toastify';
import Header from '../components/Header';

import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <ToastContainer />
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
