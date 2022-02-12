import classNames from "classnames";
import React, { useState } from "react";
import { authService } from "../fbase";
import styles from "./AuthForm.module.scss";
export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 기존 계정 로그인 or 회원가입
  const [newAccount, setNewAccount] = useState(false);
  const [error, setError] = useState("");

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
  };

  // 새 계정일 경우 submit 시 createUserWithEmailAndPassword 가 input을 받아서 계정 생성 후 로그인
  // 기존 계정일 경우 submit 시 signInWithEmailAndPassword 가 input을 받아서 로그인
  const onSubmit = async (e) => {
    e.preventDefault();
    let data;
    try {
      if (newAccount) {
        data = await authService.createUserWithEmailAndPassword(
          email,
          password
        );
      } else {
        data = await authService.signInWithEmailAndPassword(email, password);
      }
      console.log(data);
    } catch (error) {
      setError(error.message);
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
        <div className={styles.error}>{error}</div>

        <div className={styles["btn-group"]}>
          <input
            className={classNames(styles.submit, styles.btn)}
            type="submit"
            value={newAccount ? "가입하기" : "로그인"}
          />
          <span
            onClick={toggleAccount}
            className={classNames(styles.create, styles.btn)}
          >
            {newAccount ? "기존 계정으로 로그인" : "새 계정 만들기"}
          </span>
        </div>
      </form>
    </div>
  );
}
