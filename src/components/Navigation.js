import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navigation.module.scss";
// import logoImg from "../images/logo512.png";

export default function Navigation({ userObj }) {
  return (
    <ul className={styles.nav}>
      <li
        className={classNames(styles["nav__item"], styles["nav__item--home"])}
      >
        <Link to="/" className={styles.Link}>
          {/* <img className={styles.logo} src={logoImg} alt="Meta beef logo" /> */}
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
            <img
              className={styles["profile-img"]}
              src={userObj.photoURL}
              alt="Profile"
              width="30px"
              height="30px"
            />
          </Link>
        )}
      </li>
    </ul>
  );
}
