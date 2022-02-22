import classNames from "classnames";
import React, { useState } from "react";
import { dbService, storageService } from "../fbase";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import ImgModal from "./ImgModal";
import styles from "./Meb.module.scss";

export default function Meb({ mebObj, isOwner, setDoUpdate }) {
  // Meb 수정 모드 토글
  const [editing, setEditing] = useState(false);
  const [newMeb, setNewMeb] = useState(mebObj.text);
  // 이미지 모달
  const [modalActive, setModalActive] = useState(false);

  // 글 삭제
  const onDeleteClick = async () => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (ok) {
      await dbService.doc(`mebs/${mebObj.id}`).delete();

      if (mebObj.attachmentUrl !== "") {
        await storageService.refFromURL(mebObj.attachmentUrl).delete();
      }
    }
    if (typeof setDoUpdate === "function") {
      setDoUpdate((prev) => prev + 1);
    }
  };

  // 글 수정 모드 토글
  const toggelEditing = () => {
    setEditing((prev) => !prev);
    setNewMeb(mebObj.text);
  };

  // 글 수정 내용 업로드
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

  return (
    <div className={styles.container}>
      {/* 이미지 모달 */}
      {modalActive !== false && (
        <ImgModal
          photoURL={
            modalActive === "post" ? mebObj.attachmentUrl : mebObj.profileImg
          }
          setModalActive={setModalActive}
        />
      )}
      {/* 수정 탭 */}
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            className={styles["text-length-counter"]}
            style={{ color: newMeb.length > 120 ? "red" : "inherit" }}
          >
            {newMeb.length} / 120
          </div>
          <form onSubmit={onSubmit}>
            <input
              className={styles["edit__text-input"]}
              onChange={onChange}
              type="text"
              placeholder="내용을 입력하세요."
              value={newMeb}
              required
              maxLength={120}
            />
            <div className={styles["edit__btn-wrapper"]}>
              <input
                id="edit-submit"
                type="submit"
                value="완료"
                className={classNames(styles["edit__submit"])}
              />
              <button
                className={classNames(styles["edit__cancel"])}
                onClick={toggelEditing}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      ) : (
        // 기본 게시글 창
        <div className={styles["meb-box"]}>
          <div className={styles["responsive-wrapper"]}>
            <div className={styles["meb-box__user"]}>
              <span
                className={styles["profile-img"]}
                onClick={() => {
                  setModalActive("profile");
                }}
              >
                <img src={mebObj.profileImg} alt="profile" />
              </span>
              <span
                className={styles["username"]}
                onClick={() => {
                  setModalActive("profile");
                }}
              >
                {mebObj.displayName}
              </span>
            </div>
            <h4 className={styles["meb-box__text"]}>{mebObj.text}</h4>
          </div>
          {mebObj.attachmentUrl && (
            <div className={styles["meb-box__img"]}>
              <img
                src={mebObj.attachmentUrl}
                alt={mebObj.attachmentUrl}
                onClick={() => {
                  setModalActive("post");
                }}
              />
            </div>
          )}
          {/* 게시글 작성자 툴바 */}
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
