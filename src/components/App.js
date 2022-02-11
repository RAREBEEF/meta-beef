import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import RouterComponent from "./Router";
import { authService } from "../fbase";
import logoImg from "../images/logo512.png";
import LoadingIcon from "../icons/LoadingIcon";

function App() {
  // 화면을 출력할지 여부
  const [init, setInit] = useState(false);
  // 로그인 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 유저 정보
  const [userObj, setUserObj] = useState(null);

  useEffect(() => {
    // 유저 인증 정보의 변동을 모니터링한다.
    // 업데이트 이전일 경우 페이지의 출력을 보류한다. (init)
    // 업데이트 이후 인증 여부에 따라 로그인 / 비로그인 여부를 구분한다. (isLoggedIn)
    authService.onAuthStateChanged((user) => {
      if (user) {
        // if (user.displayName === null) {
        //   user.updateProfile({ displayName: "Meb" });
        // }
        // if (user.photoURL === null) {
        //   user.updateProfile({ photoURL: logoImg });
        // }
        setIsLoggedIn(true);
        setUserObj({
          displayName: user.displayName ? user.displayName : "익명",
          uid: user.uid,
          updateProfile: (args) => user.updateProfile(args),
          photoURL: user.photoURL ? user.photoURL : logoImg,
        });
      } else {
        setIsLoggedIn(false);
        setUserObj(null);
      }
      setInit(true);
    });
  }, []);

  // 프로필 정보 변경 시 새로고침을 담당하는 함수
  const refreshUser = () => {
    const user = authService.currentUser;
    setUserObj({
      displayName: user.displayName,
      uid: user.uid,
      updateProfile: (args) => user.updateProfile(args),
      photoURL: user.photoURL,
    });
  };

  return (
    <div className={styles.app}>
      {init ? (
        <RouterComponent
          isLoggedIn={isLoggedIn}
          userObj={userObj}
          refreshUser={refreshUser}
        />
      ) : (
        <div className={styles.loading}>
          <LoadingIcon />
        </div>
      )}
      <footer>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
}

export default App;
