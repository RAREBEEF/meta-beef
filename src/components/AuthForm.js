import classNames from "classnames";
import React, { useState } from "react";
import { authService } from "../fbase";
import styles from "./AuthForm.module.scss";

export default function AuthForm({ alert, setAlert }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 기존 계정 로그인 or 회원가입
  const [newAccount, setNewAccount] = useState(false);

  const [findPw, setFindPw] = useState(false);

  const onChange = (e) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  // 로그인 / 회원가입 토글
  const toggleAccount = () => {
    setNewAccount((prev) => !prev);
    setFindPw(false);
  };

  const toggleFindPw = () => {
    setFindPw((prev) => !prev);
    setNewAccount(false);
  };

  // 새 계정일 경우 submit 시 createUserWithEmailAndPassword 가 input을 받아서 계정 생성 후 로그인
  // 기존 계정일 경우 submit 시 signInWithEmailAndPassword 가 input을 받아서 로그인
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (newAccount) {
        await authService.createUserWithEmailAndPassword(email, password);
      } else if (!newAccount && !findPw) {
        let isTest = false;
        if (email === "test" && password === "test") isTest = true;
        await authService.signInWithEmailAndPassword(
          isTest ? "test@test.com" : email,
          isTest ? "test@test.com" : password
        );
      } else if (findPw) {
        await authService
          .sendPasswordResetEmail(email)
          .then(setAlert("메일이 발송되었습니다."));
      }
    } catch (error) {
      setAlert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles.form}>
        <input
          name="email"
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={onChange}
          autoComplete="username"
          className={classNames(styles.email, styles["input--text"])}
        />
        {!findPw && (
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={onChange}
            autoComplete="current-password"
            className={classNames(styles.password, styles["input--text"])}
          />
        )}
        <div className={styles.alert}>{alert}</div>

        <div className={styles["btn-group"]}>
          <input
            className={classNames(styles.submit, styles.btn)}
            type="submit"
            value={
              findPw
                ? "재설정 메일 발송"
                : newAccount
                ? "위 정보로 가입하기"
                : "로그인"
            }
          />
          <span
            onClick={toggleAccount}
            className={classNames(styles.create, styles.btn)}
          >
            {newAccount ? "기존 계정으로 로그인" : "새 계정 만들기"}
          </span>
          <span onClick={toggleFindPw} className={classNames(styles.btn)}>
            {findPw ? "돌아가기" : "비밀번호 재설정"}
          </span>
        </div>
      </form>
    </div>
  );
}
