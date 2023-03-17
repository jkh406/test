import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AuthConsumer, AuthProvider } from 'src/contexts/auth-context';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import 'simplebar-react/dist/simplebar.min.css';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

// _app.js는 client에서 띄우길 바라는 전체 컴포넌트
// 공통된 어플리케이션 로직이 필요하다면, _app.js

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useNProgress();

  const getLayout = Component.getLayout ?? ((page) => page);

  const theme = createTheme(); //Styled Components의 Theme

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>
          AnBTech Webffice
        </title>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width"
        />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline /> 
            <AuthConsumer>
              {
                (auth) => auth.isLoading
                  ? <SplashScreen />
                  : getLayout(<Component {...pageProps} />) //pageProps는 페이지 getInitialProps를 통해 내려 받은 props
                  // getLayout : 프로젝트를 진행하면서 모든페이지에 공통으로 들어가는 헤더와 푸터 등을 포함해 레이아웃컴포넌트를 만들고 아래와같이 감싸주는 방식
                  // AdapterDateFns : 날짜 및 시간 선택기 구성 요소
                  // AuthProvider : 인증 제공자 
                  // ThemeProvider : 하위 공통 스타일
                  // CssBaseline : 도구에 css요소 표현 
                  // ... : 스프레드 속성. props를 다른 컴포넌트로 전달 (배열)
                  // getInitialProps
                  // 웹 페이지는 각 페이지마다 사전에 불러와야할 데이터들이 있다.
                  // Data Fectching이라고도 하는 로직은 CSR(Client Side Rendering)에서는 react 로직에 따라 
                  // componentDidMount or useEffect로 컴포넌트가 마운트 되고 나서 하는 경우가 많다. 이 과정을 서버에서 미리 처리하도록 도와주는 것이 바로 getInitialProps이다.
              }
            </AuthConsumer>
          </ThemeProvider>
        </AuthProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
};

export default App;
