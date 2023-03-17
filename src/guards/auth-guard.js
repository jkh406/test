import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuthContext } from 'src/contexts/auth-context';

export const AuthGuard = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);
  // 구성요소 마운트 시에만 인증 확인을 수행합니다.
  // 이 흐름을 사용하면 로그아웃 후 사용자를 수동으로 리디렉션할 수 있습니다. 그렇지 않으면
  // 트리거되고 자동으로 로그인 페이지로 리디렉션됩니다.

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      // React.StrictMode가 활성화된 개발 모드에서 두 번 호출하는 것을 방지합니다.
      if (ignore.current) {
        return;
      }

      ignore.current = true;

      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting', isAuthenticated);
        router
          .replace({
            pathname: '/auth/login',
            query: router.asPath !== '/' ? { continueUrl: router.asPath } : undefined
          })
          .catch(console.error);
      } else {
        setChecked(true);
      }
    },
    [router.isReady]
  );

  if (!checked) {
    return null;
  }

   // 여기에 도달했다면 리디렉션이 발생하지 않았음을 의미하며 사용자가
   // 인증/권한 부여.

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node //데이터 유효성 검증, node 객체 
};
