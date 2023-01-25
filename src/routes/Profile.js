import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, dbService, storageService } from "../fbase";
import { v4 as uuidv4 } from "uuid";
import Meb from "../components/Meb";
import styles from "./Profile.module.scss";
import SubmitLoadingIon from "../icons/SubmitLoadingIcon.js";
import defaultProfileImg from "../images/defaultProfileImg.png";
import classNames from "classnames";

export default function Profile({ userObj, refreshUser }) {
  const testerId = "ZsTy9n6HxzP0U0NUt2I3Cpf5FK82";
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [attachment, setAttachment] = useState("");
  const [myMebs, setMyMebs] = useState([]);
  const [doUpdate, setDoUpdate] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState("");

  const navigate = useNavigate();

  // 내 Meb들만 불러오기
  const getMyMeb = useCallback(async () => {
    const myMebData = await dbService
      .collection("mebs")
      .where("creatorId", "==", userObj.uid)
      .orderBy("createdAt", "desc")
      .get();
    const myMebArray = myMebData.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMyMebs(myMebArray);
  }, [userObj.uid]);

  useEffect(() => {
    getMyMeb();
  }, [doUpdate, getMyMeb]);

  const onLogOutClick = () => {
    authService.signOut();
    navigate("/");
  };

  const onDeleteClick = async (e) => {
    e.preventDefault();
    if (!authService.currentUser) {
      return;
    }
    if (authService.currentUser.uid === testerId) {
      window.alert("테스트 계정의 정보는 변경하실 수 없습니다.");
      return;
    }
    const ok = window.confirm(
      "정말 탈퇴하시겠습니까?\n작성한 글은 삭제되지 않습니다."
    );
    if (ok) {
      await authService.currentUser.delete();
      navigate("/");
    }
  };
  // 프사 & 닉네임 & 비밀번호 업데이트
  // 프사의 경우 URL이 너무 길다는 에러 때문에 우선 storage에 업로드하고 해당 파일의 url을 user photo로 불러왔다.
  // 프사 업데이트 시 내 모든 게시글의 프사 url을 업데이트한다.
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!authService.currentUser) {
      return;
    }
    if (authService.currentUser.uid === testerId) {
      window.alert("테스트 계정의 정보는 변경하실 수 없습니다.");
      return;
    }

    // 변경사항이 있을 경우
    if (userObj.displayName !== newDisplayName || attachment !== "") {
      let newProfileImgUrl = "";

      // 업데이트 중 Submit 버튼 비활성화
      setUploading(true);

      // 닉네임에 변경사항이 있을 경우
      if (newDisplayName !== "") {
        myMebs.forEach((meb) => {
          if (meb.displayName !== newDisplayName) {
            dbService
              .doc(`mebs/${meb.id}`)
              .update("displayName", newDisplayName);
          }
        });
      }

      // 프사에 변경사항이 있을 경우
      if (attachment !== "") {
        if (userObj.photoURL !== defaultProfileImg) {
          await storageService
            .refFromURL(userObj.photoURL)
            .delete()
            .catch((error) => {
              console.log(error.message);
            });
        }

        const attachmentRef = storageService
          .ref()
          .child(`${userObj.uid}/${uuidv4()}`);

        const response = await attachmentRef.putString(attachment, "data_url");

        newProfileImgUrl = await response.ref.getDownloadURL();

        // 내 모든 글의 프사 변경
        myMebs.forEach((meb) => {
          if (meb.profileImg !== newProfileImgUrl) {
            dbService
              .doc(`mebs/${meb.id}`)
              .update("profileImg", newProfileImgUrl);
          }
        });
      }

      // 변경사항 반영
      await userObj
        .updateProfile({
          displayName:
            newDisplayName !== "" ? newDisplayName : userObj.displayName,
          photoURL:
            newProfileImgUrl !== "" ? newProfileImgUrl : userObj.photoURL,
        })
        .then(setUploading(false)); // Submit 버튼 활성화

      // 새로고침
      refreshUser();
      setDoUpdate((prev) => prev + 1);
    }
  };

  const onDisplayNameChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewDisplayName(value);
  };

  // 프로필 사진 첨부
  const onFileChange = (e) => {
    const {
      target: { files },
    } = e;

    const file = files[0];

    const reader = new FileReader();

    reader.onloadend = (e) => {
      const {
        target: { result },
      } = e;
      setAttachment(result);
    };

    reader.readAsDataURL(file);
  };

  const onChangePwClick = async () => {
    try {
      await authService
        .sendPasswordResetEmail(authService.currentUser.email)
        .then(setAlert("메일이 발송되었습니다."));
    } catch (error) {
      setAlert(error);
    }
  };

  const onImgError = (e) => {
    e.target.src = defaultProfileImg;
  };

  return (
    <main className={styles.container}>
      <div className={styles["profile-img"]}>
        <img
          src={attachment ? attachment : userObj.photoURL}
          alt="Profile"
          onError={onImgError}
        />
      </div>
      <form onSubmit={onSubmit} className={styles["form"]}>
        <div>
          <label htmlFor="profileImg" className={styles["input--img"]}>
            사진 변경
          </label>
          <input
            id="profileImg"
            onChange={onFileChange}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
        <div>
          <label
            htmlFor="displayName"
            className={classNames(
              styles["input--name__label"],
              styles["edit__label"]
            )}
          >
            닉네임
          </label>
          <input
            id="displayName"
            onChange={onDisplayNameChange}
            value={newDisplayName}
            type="text"
            placeholder="Display name"
            className={classNames(styles["input--name"], styles["edit__input"])}
            maxLength={10}
            minLength={2}
          />
        </div>
        <div>
          <input
            id="submit"
            type="submit"
            value="프로필 업데이트"
            className={styles.submit}
            style={{ display: uploading ? "none" : "inline" }}
          />

          <div className={styles.alert}>{alert}</div>
        </div>
        <div>
          {uploading && (
            <label htmlFor="submit" className={styles.submit}>
              <SubmitLoadingIon />
            </label>
          )}
          <button className={styles["change-pw"]} onClick={onChangePwClick}>
            비밀번호 재설정
          </button>
          <button className={styles.logout} onClick={onLogOutClick}>
            로그아웃
          </button>
          <button className={styles.delete} onClick={onDeleteClick}>
            탈퇴하기
          </button>
        </div>
      </form>
      <h2 className={styles["list-title"]}>내가 쓴 글</h2>
      {myMebs.length === 0 ? (
        <div className={styles["no-mebs"]}>
          <div>작성한 글이 없습니다.</div>
          <div>첫 소식을 공유해 보세요.</div>
        </div>
      ) : (
        myMebs.map((meb) => (
          <Meb
            key={meb.id}
            mebObj={meb}
            userObj={userObj}
            isOwner={meb.creatorId === userObj.uid}
            setDoUpdate={setDoUpdate}
          />
        ))
      )}
    </main>
  );
}
