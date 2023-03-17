import { createContext, useContext, useEffect, useReducer, useRef, Component } from 'react';
import PropTypes from 'prop-types';
import ApiService from "src/Service/ApiService"

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false, //인증
  isLoading: true,
  user: null
};
// 총 3개의 state를 가지고 있다. 액션의 type에 따라 리듀서에서는 state에 대한 처리를 진행하고 불변하게 새로운 객체 return
const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload; //payload : 액션의 실행에 필요한 임의의 데이터.
    console.log('user', user);
    return {
      ...state,
      ...(
        // payload (사용자) 가 제공되면 인증.
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  }
};

//리듀서 생성
const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

// 이 컨텍스트의 역할은 앱 트리를 통해 인증 상태를 전파하는 것.
// context를 이용하면 단계마다 일일이 props를 넘겨주지 않고도 컴포넌트 트리 전체에 데이터를 제공할 수 있습니다.
export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    console.log("isAuthenticated", initialized.current);
    // React.StrictMode가 활성화된 개발 모드에서 두 번 호출하는 것을 방지.
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = window.sessionStorage.getItem('authenticated') === 'true';
    } catch (err) {
      console.error(err);
    }

    if (isAuthenticated) {
      console.log("isAuthenticated", isAuthenticated);
      const user = {
        avatar: '/assets/avatars/avatar-anika-visser.png',
        name: 'admin',
        email: 'admin@anbtech.co.kr'
      };

      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE
      });
    }
  };

  //useEffect Hook을 componentDidMount와 componentDidUpdate, componentWillUnmount가 합쳐진 것으로 생각해도 좋습니다
  //seEffect Hook을 이용하여 우리는 React에게 컴포넌트가 렌더링 이후에 어떤 일을 수행해야하는 지를 말합니다.
  //React는 우리가 넘긴 함수를 기억했다가(이 함수를 ‘effect’라고 부릅니다) DOM 업데이트를 수행한 이후에 불러낼 것입니다.
  //useEffect 라는 Hook 을 사용하여 컴포넌트가 마운트 됐을 때 (처음 나타났을 때), 언마운트 됐을 때 (사라질 때), 그리고 업데이트 될 때 (특정 props가 바뀔 때) 특정 작업을 처리
  //useEffect 에서는 함수를 반환 할 수 있는데 이를 cleanup 함수라고 부릅니다
  //cleanup 함수는 useEffect 에 대한 뒷정리
  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const skip = () => {
    try {
      window.sessionStorage.setItem('authenticated', 'true');
    } catch (err) {
      console.error(err);
    }

    const user = {
      id: 'SkipID',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'SKIP',
      email: 'SKIP@anbtech.co.kr'
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user
    });
  };

  const signIn = async (_email, _password) => {

    ApiService.checkUserByEmail(_email)
    .then( res => {
      if(!res.data.email)
      {
        console.log("test", res.data.email);
        throw new Error('계정이 존재하지 않습니다.');
      }
      else{
        if (_email !== 'admin@anbtech.co.kr' || _password !== 'admin') {
          throw new Error('관리자 계정이 아닙니다.');
        }
        else{
          const user = {
            id: res.data.id,
            avatar: res.data.avatar,
            name: res.data.name,
            email: res.data.email
          };
          console.log("test", res.data.email);
          try {
            window.sessionStorage.setItem('authenticated', 'true');
          } catch (err) {
            console.error(err);
          }
      
          dispatch({
            type: HANDLERS.SIGN_IN,
            payload: user
          });
        }
      }
    })
    .catch(err => {
      console.log('loadUser() 에러', err);
    });

  };

  const signUp = async (_email, _name, _password) => {

    ApiService.checkUserByEmail(_email)
      .then( res => {
        if(!res.data.email)
        {
          let user = {
            name: _name,
            password: _password,
            email: _email,
          }
      
          ApiService.addUser(user)
          .then( res => {
              this.setState({
                message: user.name + '님이 성공적으로 등록되었습니다.'
              })
          })
          .catch( err => {
            console.log('saveUser() 에러', err);
          });
        }
      })
      .catch(err => {
        console.log('loadUser() 에러', err);
      });

      throw new Error('이미 존재하는 계정입니다.');
  };

  const signOut = () => {
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        skip,
        signIn,
        signUp,
        signOut
      }}
      
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
