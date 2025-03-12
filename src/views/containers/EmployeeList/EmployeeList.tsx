import { Container } from "@mui/material";
import React from "react";
import { CallBack } from "../../../react_class/hooks/useCallback/useCallBack";

export const EmployeeList: React.FC<{}> = () => {
  return (
    <Container maxWidth="sm">
      <CallBack />
    </Container>
  );
};
