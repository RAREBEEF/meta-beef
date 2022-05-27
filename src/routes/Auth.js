/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { fbaseInstance, authService } from "../fbase";
import styles from "./Auth.module.scss";
import logoImg from "../images/logo512transparent.png";
import googleIcon from "../icons/google-brands.svg";
import githubIcon from "../icons/github-brands.svg";
import classNames from "classnames";
export default function auth() {
  const [alert, setAlert] = useState("");
  // 소셜 로그인(팝업)
  const onSocialClick = async (e) => {
    const {
      target: { name },
    } = e;
    let provider;
    if (name === "google") {
      provider = new fbaseInstance.auth.GoogleAuthProvider();
    } else if (name === "github") {
      provider = new fbaseInstance.auth.GithubAuthProvider();
    }
    try {
      await authService.signInWithPopup(provider);
    } catch (error) {
      setAlert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img
          className={styles["logo-img"]}
          src={logoImg}
          alt="Meta beef logo"
        />
        <span className={styles["logo-text"]}>Meta Beef</span>
      </div>
      <AuthForm alert={alert} setAlert={setAlert} />
      <div className={styles.social}>
        <img
          src={googleIcon}
          alt="google"
          onClick={onSocialClick}
          name="google"
          className={classNames(styles.google, styles.btn)}
        />
        <img
          src={githubIcon}
          alt="github"
          onClick={onSocialClick}
          name="github"
          className={classNames(styles.github, styles.btn)}
        />
      </div>
    </div>
  );
}
