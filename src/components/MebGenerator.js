import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { storageService, dbService } from "../fbase";
import PhotoIcon from "../icons/PhotoIcon";
import SubmitIcon from "../icons/SubmitIcon";
import SubmitLoadingIcon from "../icons/SubmitLoadingIcon";
import DeleteIcon from "../icons/DeleteIcon";
import styles from "./MebGenerator.module.scss";
import classNames from "classnames";

export default function MebGenerator({ userObj }) {
  const [meb, setMeb] = useState("");
  const [attachment, setAttachment] = useState("");
  const attachmentInputRef = useRef();
  // 업로드 중 submit 비활성화(중복 업로드 방지)
  const [submitDisabled, setSubmitDisabled] = useState(false);

  // 작성한 내용을 db에 업로드한다.
  const onSubmit = async (e) => {
    e.preventDefault();

    // 작성 내용 없을 경우 return
    if (!attachment && !meb) {
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
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;

    setMeb(value);
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
        style={{ color: meb.length > 120 ? "red" : "inherit" }}
      >
        {meb.length} / 120
      </div>
      <form onSubmit={onSubmit} className={styles["input-wrapper"]}>
        <input
          value={meb}
          onChange={onChange}
          type="text"
          placeholder="일상 공유하기"
          maxLength={120}
          required
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
