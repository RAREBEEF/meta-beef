import React, { useEffect, useState } from "react";
import Meb from "../components/Meb";
import MebGenerator from "../components/MebGenerator";
import { dbService } from "../fbase";
import styles from "./Home.module.scss";
import logoImg from "../images/logo512transparent.png";

export default function Home({ userObj }) {
  // db로부터 mebs를 받아올 state
  const [mebs, setMebs] = useState([]);
  // db에 어떠한 변동 혹은 작업이 발생하면 mebs를 업데이트한다.
  // 실시간으로 새로운 meb이 업로드되는 것을 확인할 수 있다.
  // 스냅샷 로직을 함수에 할당하고 클린업에서 함수를 호출하여 정리할 수 있다.
  useEffect(() => {
    const snapshotFunction = dbService
      .collection("mebs")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const mebArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMebs(mebArray);
      });

    return () => {
      snapshotFunction();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img
          className={styles["logo-img"]}
          src={logoImg}
          alt="Meta beef logo"
        />
      </div>
      <MebGenerator userObj={userObj} />
      <div>
        {mebs.map((meb) => (
          <Meb
            key={meb.id}
            mebObj={meb}
            isOwner={
              meb.creatorId === userObj.uid ||
              userObj.uid === "CPiQGqb4ambsw2RplHzeGcgODuX2"
            }
          />
        ))}
      </div>
    </div>
  );
}
