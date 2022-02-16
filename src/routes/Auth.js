/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import AuthForm from "../components/AuthForm";
import { fbaseInstance, authService } from "../fbase";
import styles from "./Auth.module.scss";
import logoImg from "../images/logo512transparent.png";

export default function auth() {
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
    await authService.signInWithPopup(provider);
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
      <AuthForm />
      <div className={styles.social}>
        <button onClick={onSocialClick} name="google" className={styles.google}>
          Continue with Google
        </button>
        <button onClick={onSocialClick} name="github" className={styles.github}>
          Continue with Github
        </button>
      </div>
    </div>
  );
}
