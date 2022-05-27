import classNames from "classnames";
import React, { useCallback, useRef, useState } from "react";
import { dbService, storageService } from "../fbase";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import LikeIcon from "../icons/LikeIcon";
import ImgModal from "./ImgModal";
import styles from "./Meb.module.scss";

export default function Meb({
  mebObj,
  isOwner,
  isAdmin,
  setDoUpdate,
  userObj,
}) {
  const textareaRef = useRef();
  // Meb 수정 모드 토글
  const [editing, setEditing] = useState(false);
  const [newMeb, setNewMeb] = useState(mebObj.text);
  // 이미지 모달
  const [modalActive, setModalActive] = useState(false);
  const [liked, setLiked] = useState(mebObj.like.indexOf(userObj.uid) !== -1);

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

  // 좋아요
  const onLikeClick = async (e) => {
    e.preventDefault();

    setLiked((prev) => !prev);

    const myIndex = mebObj.like.indexOf(userObj.uid);

    if (myIndex !== -1) {
      mebObj.like.splice(myIndex, 1);
      await dbService.doc(`mebs/${mebObj.id}`).update("like", mebObj.like);

      return;
    }

    await dbService
      .doc(`mebs/${mebObj.id}`)
      .update("like", [...mebObj.like, userObj.uid]);
  };

  // 글 수정 내용 업로드
  const onSubmit = async (e) => {
    e.preventDefault();

    await dbService
      .doc(`mebs/${mebObj.id}`)
      .update("text", newMeb, "edited", new Date().getTime());
    setEditing((prev) => !prev);
  };

  // textarea 높이 조절
  const resize = useCallback(() => {
    if (!textareaRef.current) {
      return;
    }

    const currentRef = textareaRef.current;
    currentRef.style.height = "54px";
    currentRef.style.height = `${currentRef.scrollHeight + 4}px`;
  }, []);

  // textarea 입력 & 줄 제한
  const onChange = (e) => {
    let currentRows = e.target.value.split("\n").length;
    const maxRows = e.target.rows;

    if (!isAdmin && currentRows === maxRows) {
      return;
    }

    const {
      target: { value },
    } = e;

    setNewMeb(value);
    resize();
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
            style={{ color: newMeb.length > 150 ? "red" : "inherit" }}
          >
            {newMeb.length} / 150
          </div>
          <form onSubmit={onSubmit}>
            <textarea
              className={styles["edit__text-input"]}
              rows={15}
              ref={textareaRef}
              onChange={onChange}
              placeholder="내용을 입력하세요."
              value={newMeb}
              required
              maxLength={isAdmin ? "none" : 150}
              onFocus={resize}
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
        <div className={classNames(styles["meb-box"])}>
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
            <div className={styles["middle-section-wrapper"]}>
              <div className={styles["meb-box__text"]}>{mebObj.text}</div>
              <div className={styles["meb-box__date"]}>
                {`${new Date(mebObj.createdAt).getFullYear()}/${
                  new Date(mebObj.createdAt).getMonth() < 10 ? "0" : ""
                }${new Date(mebObj.createdAt).getMonth()}/${
                  new Date(mebObj.createdAt).getDate() < 10 ? "0" : ""
                }${new Date(mebObj.createdAt).getDate()} ${
                  new Date(mebObj.createdAt).getHours() < 10 ? "0" : ""
                }${new Date(mebObj.createdAt).getHours()}:${
                  new Date(mebObj.createdAt).getMinutes() < 10 ? "0" : ""
                }${new Date(mebObj.createdAt).getMinutes()}`}
                {mebObj.edited && " (수정됨)"}
              </div>
            </div>
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
          <div className={styles["btn-wrapper"]}>
            {(isOwner || isAdmin) && (
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

            <button
              onClick={onLikeClick}
              className={classNames(styles["btn--like"], styles.btn)}
            >
              <span className={styles["like-counter"]}>
                {mebObj.like.length !== 0 &&
                  mebObj.like.length.toLocaleString("ko-KR")}
              </span>
              <LikeIcon liked={liked} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
