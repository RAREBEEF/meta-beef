import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
export default function LikeIcon({ liked }) {
  return (
    <FontAwesomeIcon
      icon={faHeart}
      size="lg"
      style={{ color: liked ? "pink" : "gray" }}
    />
  );
}
