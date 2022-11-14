import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import RouterComponent from "./Router";
import { authService } from "../fbase";
// import defaultProfileImg from "../images/defaultProfileImg.png";
import LoadingIcon from "../icons/LoadingIcon";

function App() {
  // 유저 인증 정보 로드 전 화면 출력 제한
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
        setIsLoggedIn(true);
        setUserObj({
          displayName: user.displayName ? user.displayName : "익명", // 신규 가입시 닉네임 --> "익명"
          uid: user.uid,
          updateProfile: (args) => user.updateProfile(args),
          photoURL: user.photoURL
            ? user.photoURL
            : "https://firebasestorage.googleapis.com/v0/b/meta-beef.appspot.com/o/defaultProfileImg.png?alt=media&token=a6ba2add-766b-48d5-9020-a852111f6aeb", // 신규 가입시 기본 프사
        });
      } else {
        setIsLoggedIn(false);
        setUserObj(null);
      }
      setInit(true);
    });
  }, []);

  // 프로필 정보 변경 시 새로고침
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
