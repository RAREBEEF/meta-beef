import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
export default function SubmitIcon() {
  return (
    <FontAwesomeIcon
      icon={faPaperPlane}
      size="lg"
      style={{ color: "#F221718" }}
    />
  );
}
