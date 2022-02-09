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
  // controlled component
  const [meb, setMeb] = useState("");
  // 첨부파일
  const [attachment, setAttachment] = useState("");
  // 파일 input 레퍼런스
  const attachmentInputRef = useRef();

  const [submitDisabled, setSubmitDisabled] = useState(false);

  // 작성한 meb을 db에 업로드한다.
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!attachment && !meb) {
      return;
    }
    setSubmitDisabled(true);
    let attachmentUrl = "";

    if (attachment !== "") {
      const attachmentRef = storageService
        .ref()
        .child(`${userObj.uid}/${uuidv4()}`);

      const response = await attachmentRef.putString(attachment, "data_url");

      attachmentUrl = await response.ref.getDownloadURL();
    }

    const mebObj = {
      text: meb,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      displayName: userObj.displayName,
      profileImg: userObj.photoURL,
      attachmentUrl,
    };

    await dbService
      .collection("mebs")
      .add(mebObj)
      .then(() => {
        setMeb("");
        setAttachment("");
        attachmentInputRef.current.value = null;
        setSubmitDisabled(false);
      });
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;

    setMeb(value);
  };

  // 파일 업로드
  // input으로 부터 첨부파일을 꺼낸 뒤 FileReader를 통해 Data URL을 읽어온다.
  // FileReader는 이벤트 리스너(onloadend)를 통해 로드가 완료되면 Data URL을 setState 한다.
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

  const onClearAttachmentClick = () => {
    setAttachment("");
    attachmentInputRef.current.value = null;
  };

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles["inputs-wrapper"]}>
        <input
          value={meb}
          onChange={onChange}
          type="text"
          placeholder="일상 공유하기"
          maxLength={120}
          required
          className={styles["input--text"]}
          autoFocus
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
