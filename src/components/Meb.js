import classNames from "classnames";
import React, { useState } from "react";
import { dbService, storageService } from "../fbase";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import ImgModal from "./ImgModal";
import styles from "./Meb.module.scss";

export default function Meb({ mebObj, isOwner, setNeedUpdate }) {
  // Meb 수정 모드 토글
  const [editing, setEditing] = useState(false);
  // Meb 수정한 내용
  const [newMeb, setNewMeb] = useState(mebObj.text);

  const [modalActive, setModalActive] = useState(false);

  // Meb 삭제
  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you wont to delete this meb?");
    if (ok) {
      await dbService.doc(`mebs/${mebObj.id}`).delete();

      if (mebObj.attachmentUrl !== "") {
        await storageService.refFromURL(mebObj.attachmentUrl).delete();
      }
    }
    if (typeof setNeedUpdate === "function") {
      setNeedUpdate((prev) => prev + 1);
    }
  };

  // Meb 수정 모드 토글
  const toggelEditing = () => {
    setEditing((prev) => !prev);
    setNewMeb(mebObj.text);
  };

  // Meb 수정 내용 업로드
  const onSubmit = async (e) => {
    e.preventDefault();
    await dbService.doc(`mebs/${mebObj.id}`).update("text", newMeb);
    setEditing((prev) => !prev);
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewMeb(value);
  };

  const onImgClick = () => {
    setModalActive(true);
  };

  return (
    <div className={styles.container}>
      {modalActive && (
        <ImgModal
          photoURL={mebObj.attachmentUrl}
          setModalActive={setModalActive}
        />
      )}
      {editing ? (
        <>
          <form onSubmit={onSubmit} className={styles["wrapper__input--edit"]}>
            <input
              className={styles["edit--text"]}
              onChange={onChange}
              type="text"
              placeholder="내용을 입력하세요."
              value={newMeb}
              required
              maxLength={120}
            />
            <div className={styles["edit-btn-wrapper"]}>
              <input
                id="edit-submit"
                type="submit"
                value="완료"
                className={classNames(styles["edit--submit"])}
              />
              <button
                className={classNames(styles["edit--cancel"])}
                onClick={toggelEditing}
              >
                취소
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className={styles["meb-box"]}>
          <div className={styles["meb-box--user"]}>
            <span className={styles["profile-img"]}>
              <img src={mebObj.profileImg} alt="profile" />
            </span>
            <span className={styles["username"]}>{mebObj.displayName}</span>
          </div>
          <h4 className={styles["meb-box__text"]}>{mebObj.text}</h4>
          {mebObj.attachmentUrl && (
            <div className={styles["meb-box__img"]}>
              <img
                src={mebObj.attachmentUrl}
                alt={mebObj.attachmentUrl}
                onClick={onImgClick}
              />
            </div>
          )}
          {isOwner && (
            <>
              <button
                onClick={onDeleteClick}
                className={classNames(styles["btn--delete"], styles.btn)}
              >
                <DeleteIcon />
              </button>
              <button
                onClick={toggelEditing}
                className={classNames(styles["btn--edit"], styles.btn)}
              >
                <EditIcon />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
