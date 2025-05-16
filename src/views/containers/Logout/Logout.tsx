import { useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { PATHS } from "../../../constant";
import { useNavigate } from "react-router";

export const Logout = () => {
  // CURRENT URL/PATH LOCATORS
  const { pathname } = window.location;

  // NAVIGATE TO SPECIFIC USER
  let navigate = useNavigate();

  // AUTOMOMATICALLY NAVIGATE TO LOGIN SCREEN
  useEffect(() => {
    if (pathname === PATHS.LOGOUT.path) navigate(PATHS.LOGIN.path);
  }, [pathname]);

  return <Fragment></Fragment>;
};
