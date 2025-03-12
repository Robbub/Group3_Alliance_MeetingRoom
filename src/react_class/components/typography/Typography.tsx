import React from "react";
import "./typography.css";

export enum Size {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large"
}

interface CommonTypographyInterface {
  label: string;
  style?: React.CSSProperties;
  size?: Size;
  onClick?: () => void;
  onClickSamp?: VoidFunction;
}

export const CommonTypography = ({
  style,
  label,
  size,
  onClick
}: CommonTypographyInterface) => {
  return (
    <label
      onClick={onClick}
      className={`typography-style ` + size}
      style={style}
    >
      {label}
    </label>
  );
};
