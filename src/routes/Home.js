import React, { useCallback, useEffect, useRef, useState } from "react";
import Meb from "../components/Meb";
import MebGenerator from "../components/MebGenerator";
import { dbService } from "../fbase";
import styles from "./Home.module.scss";
import logoImg from "../images/logo512transparent.png";
import LoadingIcon from "../icons/LoadingIcon";

export default function Home({ userObj }) {
  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadMoreBtnRef = useRef(null);
  const [mebs, setMebs] = useState([]);
  const [limit, setLimit] = useState(10);
  const [hasNextMeb, setHasNextMeb] = useState(true);

  // meb 불러오기
  const getMebs = useCallback(() => {
    const unsub = dbService
      .collection("mebs")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMebs(data);
        if (data.length + 30 < limit) setHasNextMeb(false);
        setLoading(false);
      });

    return unsub;
  }, [limit]);

  // 최초 로드
  useEffect(() => {
    const unsub = getMebs();

    return () => {
      unsub();
    };
  }, [getMebs]);

  // 최초 로드 완료시
  useEffect(() => {
    mebs.length !== 0 && setInit(true);
  }, [mebs.length]);

  // 더 불러오기
  // 이미 불러오는 중이거나 다음 meb이 없을 경우 실행x
  const onLoadMore = useCallback(() => {
    if (loading || !hasNextMeb) return;
    setLoading(true);

    const increase = limit + 10;
    getMebs(increase);
    setLimit(increase);
  }, [loading, getMebs, hasNextMeb, limit]);

  // 인피니티 스크롤 옵저버 생성
  useEffect(() => {
    if (!init) return;

    const scrollTrigger = new IntersectionObserver(
      (entries) => {
        entries[0].isIntersecting && onLoadMore();
      },
      { threshold: 1 }
    );

    loadMoreBtnRef.current && scrollTrigger.observe(loadMoreBtnRef.current);
  }, [init, onLoadMore]);

  return (
    <main className={styles.container}>
      <div className={styles.logo}>
        <img
          className={styles["logo-img"]}
          src={logoImg}
          alt="Meta beef logo"
        />
      </div>
      <MebGenerator userObj={userObj} />
      <section>
        {mebs?.map((meb) => (
          <Meb
            key={meb.id}
            mebObj={meb}
            isOwner={meb.creatorId === userObj.uid}
            userObj={userObj}
          />
        ))}
      </section>
      {loading ? (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <LoadingIcon />
        </div>
      ) : (
        <button
          onClick={onLoadMore}
          ref={loadMoreBtnRef}
          style={{ width: "100%", pointerEvents: "none", opacity: 0 }}
        >
          load More
        </button>
      )}
    </main>
  );
}
