import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navigation.module.scss";
import defaultProfileImg from "../images/defaultProfileImg.png";

export default function Navigation({ userObj }) {
  const onImgError = (e) => {
    e.target.src = defaultProfileImg;
  };
  return (
    <ul className={styles.nav}>
      <li
        className={classNames(styles["nav__item"], styles["nav__item--home"])}
      >
        <Link to="/" className={styles.Link}>
          <span className={styles["logo-text"]}>Meta Beef</span>
        </Link>
      </li>
      <li
        className={classNames(
          styles["nav__item"],
          styles["nav__item--profile"]
        )}
      >
        {userObj && (
          <Link to="/profile" className={styles.Link}>
            <span className={styles["profile-text"]}>
              {userObj.displayName}의 프로필
            </span>
            <span className={styles["profile-img"]}>
              <img src={userObj.photoURL} alt="Profile" onError={onImgError} />
            </span>
          </Link>
        )}
      </li>
    </ul>
  );
}
