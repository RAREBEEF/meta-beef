import React from "react";
import styles from "./ImgModal.module.scss";

export default function ImgModal({ photoURL, setModalActive }) {
  return (
    <div
      className={styles.container}
      onClick={() => {
        setModalActive(false);
      }}
    >
      <div className={styles.modal}>
        <img src={photoURL} alt={photoURL} />
      </div>
    </div>
  );
}
