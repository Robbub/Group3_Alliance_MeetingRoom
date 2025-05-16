import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { NavLink, Outlet, useNavigate } from "react-router";
import ListItemButton from "@mui/material/ListItemButton";
import { PATHS, SIDE_BAR_MENU } from "../../../constant";
import DrawerHeader from "../../components/DrawerHeader";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CssBaseline from "@mui/material/CssBaseline";
import React, { Fragment, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ListIcon from "@mui/icons-material/List";
import MainLayout from "../../components/Main";

import ListItem from "@mui/material/ListItem";
import AddIcon from "@mui/icons-material/Add";
import AppBar from "../../components/AppBar";
import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";

export const Main = () => {
  // CURRENT URL/PATH LOCATORS
  const { pathname } = window.location;

  // NAVIGATE TO SPECIFIC USER
  let navigate = useNavigate();

  // OPEN DRAWER LEFT SIDE
  const [openDrawer, setOpenDrawer] = React.useState(false);

  // DRAWER CUSTOMIZATION WIDTH
  const drawerWidth = 240;

  // THEME CUSTOMIZATION
  const theme = useTheme();

  useEffect(() => {
    // AUTO DIRECT USER TO DASHBOARD WHEN PATH IS DEFAULT
    if (pathname === PATHS.MAIN.path) navigate(PATHS.LOGIN.path);
  }, [pathname]);

  return (
    <Fragment>
      <CssBaseline />
      <AppBar position="fixed" open={openDrawer}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpenDrawer(!openDrawer)}
            edge="start"
            sx={[
              {
                mr: 2
              },
              openDrawer && { display: "none" }
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Alliance Reactjs Basecode
          </Typography>
        </Toolbar>
      </AppBar>
      {/* SIDE BAR DRAWER */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
        variant="persistent"
        anchor="left"
        open={openDrawer}
      >
        <DrawerHeader>
          <IconButton onClick={() => setOpenDrawer(!openDrawer)}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {/* SIDE BAR MENU ITEMS */}
        <List>
          {SIDE_BAR_MENU.map((item, index) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <ListIcon /> : <AddIcon />}
                </ListItemIcon>
                <NavLink to={item.path}>
                  <ListItemText primary={item.label} />
                </NavLink>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <MainLayout open={openDrawer}>
        <DrawerHeader />
        {/* OUTLET DISPLAY THE FOLLOWING SCREEN THAT MATCHES THE ROUTE INSIDE THE PARENT ROUTE*/}
        <Outlet />
      </MainLayout>
    </Fragment>
  );
};
