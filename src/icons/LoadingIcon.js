import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function LoadingIcon() {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      size="4x"
      style={{ color: "#F221718" }}
      spin
    />
  );
}
