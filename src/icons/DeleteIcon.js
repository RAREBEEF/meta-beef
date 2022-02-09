import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
export default function DeleteIcon() {
  return (
    <FontAwesomeIcon
      icon={faTrashAlt}
      size="lg"
      style={{ color: "#F221718" }}
    />
  );
}
