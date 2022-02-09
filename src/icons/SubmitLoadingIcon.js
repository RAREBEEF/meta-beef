import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function SubmitLoadingIcon() {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      size="lg"
      style={{ color: "#F221718" }}
      pulse
    />
  );
}
