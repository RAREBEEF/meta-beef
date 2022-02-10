import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, dbService, storageService } from "../fbase";
import { v4 as uuidv4 } from "uuid";
import Meb from "../components/Meb";
import styles from "./Profile.module.scss";

export default function Profile({ userObj, refreshUser }) {
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [attachment, setAttachment] = useState("");
  const [myMebs, setMyMebs] = useState([]);
  // 프로필 페이지에서 글 삭제 및 프로필 수정 내용 바로 업데이트 안되는거 해결 꼼수
  const [needUpdate, setNeedUpdate] = useState(0);
  const navigate = useNavigate();

  // 내 Meb들만 불러오기
  const getMyMeb = async () => {
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
  };

  useEffect(() => {
    getMyMeb();
  }, [needUpdate]);

  const onLogOutClick = () => {
    authService.signOut();
    navigate("/");
  };

  // 프로필 사진 첨부가 있을 경우 프로필 사진 업데이트
  // 닉네임이 변경되었을 경우 닉네입 업데이트
  // 프로필 사진의 경우 URL이 너무 길다는 에러 때문에 우선 storage에 업로드하고 해당 파일의 url을 user photo로 불러왔다.
  // 프사 업데이트 시 내 모든 게시글의 프사 url을 업데이트한다.
  const onSubmit = async (e) => {
    e.preventDefault();

    if (userObj.displayName !== newDisplayName || attachment !== "") {
      let newProfileImgUrl = "";

      if (attachment !== "") {
        await storageService
          .refFromURL(userObj.photoURL)
          .delete()
          .catch((error) => {
            console.log(error.message);
          });

        const attachmentRef = storageService
          .ref()
          .child(`${userObj.uid}/${uuidv4()}`);

        const response = await attachmentRef.putString(attachment, "data_url");

        newProfileImgUrl = await response.ref.getDownloadURL();

        await myMebs.forEach((meb) => {
          if (meb.profileImg !== newProfileImgUrl) {
            dbService
              .doc(`mebs/${meb.id}`)
              .update("profileImg", newProfileImgUrl);
          }
        });
      }

      if (newDisplayName !== "") {
        await myMebs.forEach((meb) => {
          if (meb.displayName !== newDisplayName) {
            dbService
              .doc(`mebs/${meb.id}`)
              .update("displayName", newDisplayName);
          }
        });
      }

      await userObj.updateProfile({
        displayName:
          newDisplayName !== "" ? newDisplayName : userObj.displayName,
        photoURL: newProfileImgUrl !== "" ? newProfileImgUrl : userObj.photoURL,
      });

      refreshUser();
      setNeedUpdate((prev) => prev + 1);
    }
  };

  console.log(myMebs);
  const onChange = (e) => {
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

  return (
    <div className={styles.container}>
      <img
        src={attachment ? attachment : userObj.photoURL}
        alt="Profile"
        className={styles["profile-img"]}
      />
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
          <label htmlFor="displayName" className={styles["input--name__label"]}>
            닉네임
          </label>
          <input
            id="displayName"
            onChange={onChange}
            value={newDisplayName}
            type="text"
            placeholder="Display name"
            className={styles["input--name"]}
          />
        </div>
        <div>
          <input
            type="submit"
            value="Update Profile"
            className={styles.submit}
          />
          <button className={styles.logout} onClick={onLogOutClick}>
            Log Out
          </button>
        </div>
      </form>
      <h2 className={styles["list-title"]}>내가 쓴 글</h2>
      {myMebs.map((meb) => (
        <Meb
          key={meb.id}
          mebObj={meb}
          isOwner={meb.creatorId === userObj.uid}
          setNeedUpdate={setNeedUpdate}
        />
      ))}
    </div>
  );
}
