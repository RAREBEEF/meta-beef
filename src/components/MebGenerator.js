import React, { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { storageService, dbService } from "../fbase";
import PhotoIcon from "../icons/PhotoIcon";
import SubmitIcon from "../icons/SubmitIcon";
import SubmitLoadingIcon from "../icons/SubmitLoadingIcon";
import DeleteIcon from "../icons/DeleteIcon";
import styles from "./MebGenerator.module.scss";
import classNames from "classnames";

export default function MebGenerator({ userObj, isAdmin }) {
  const textareaRef = useRef();
  const attachmentInputRef = useRef();
  const [meb, setMeb] = useState("");
  const [attachment, setAttachment] = useState("");
  // 업로드 중 submit 비활성화(중복 업로드 방지)
  const [submitDisabled, setSubmitDisabled] = useState(false);

  // textarea 높이 조절
  const resize = useCallback(() => {
    if (!textareaRef.current) {
      return;
    }

    const currentRef = textareaRef.current;
    currentRef.style.height = "52px";
    currentRef.style.height = `${currentRef.scrollHeight + 2}px`;
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

    setMeb(value);
    resize();
  };

  // 작성한 내용을 db에 업로드한다.
  const onSubmit = async (e) => {
    e.preventDefault();

    // 작성 내용 없을 경우 return
    if (attachment === "" && meb === "") {
      return;
    }

    // submit 비활성화
    setSubmitDisabled(true);

    let attachmentUrl = "";

    // 이미지 있을 경우
    if (attachment !== "") {
      const attachmentRef = storageService
        .ref()
        .child(`${userObj.uid}/${uuidv4()}`);

      const response = await attachmentRef.putString(attachment, "data_url");

      attachmentUrl = await response.ref.getDownloadURL();
    }

    // 업로드 할 데이터
    const mebObj = {
      text: meb,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      displayName: userObj.displayName,
      profileImg: userObj.photoURL,
      attachmentUrl,
      like: [],
    };

    // 업로드
    await dbService
      .collection("mebs")
      .add(mebObj)
      .then(() => {
        setMeb("");
        setAttachment("");
        attachmentInputRef.current.value = null;
        setSubmitDisabled(false); // submit 활성화
      });

    resize();
  };

  // 첨부 이미지 읽기
  const onFileChange = (e) => {
    const {
      target: { files },
    } = e;

    const file = files[0];

    const reader = new FileReader();

    reader.onloadend = (e) => {
      const {
        currentTarget: { result },
      } = e;
      setAttachment(result);
    };

    reader.readAsDataURL(file);
  };

  // 첨부파일 삭제
  const onClearAttachmentClick = () => {
    setAttachment("");
    attachmentInputRef.current.value = null;
  };

  return (
    <div className={styles.container}>
      <div
        className={styles["text-length-counter"]}
        style={{ color: meb.length > 150 ? "red" : "inherit" }}
      >
        {meb.length} / 150
      </div>
      <form onSubmit={onSubmit} className={styles["input-wrapper"]}>
        <textarea
          rows={15}
          ref={textareaRef}
          value={meb}
          onChange={onChange}
          placeholder="일상 공유하기"
          maxLength={isAdmin ? "none" : 150}
          className={styles["input--text"]}
        />
        <input
          id="attachmentInput"
          onChange={onFileChange}
          type="file"
          accept="image/*"
          ref={attachmentInputRef}
          style={{ display: "none" }}
        />
        {attachment ? (
          <button
            onClick={onClearAttachmentClick}
            className={classNames(styles["btn--delete"], styles.btn)}
          >
            <DeleteIcon />
          </button>
        ) : (
          <label
            htmlFor="attachmentInput"
            className={classNames(styles["input--file"], styles.btn)}
            disabled={submitDisabled}
          >
            <PhotoIcon />
          </label>
        )}
        <label
          htmlFor="submit"
          className={classNames(styles["input--submit"], styles.btn)}
          disabled={submitDisabled}
        >
          {submitDisabled ? <SubmitLoadingIcon /> : <SubmitIcon />}
        </label>
        <input id="submit" type="submit" style={{ display: "none" }} />
      </form>
      {attachment && (
        <img
          src={attachment}
          alt="Attachment"
          className={styles["preview-img"]}
        />
      )}
    </div>
  );
}
