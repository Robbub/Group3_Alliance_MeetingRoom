// import { useTheme } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import Drawer from "@mui/material/Drawer";
// import Toolbar from "@mui/material/Toolbar";
// import CssBaseline from "@mui/material/CssBaseline";
// import List from "@mui/material/List";
// import Typography from "@mui/material/Typography";
// import Divider from "@mui/material/Divider";
// import IconButton from "@mui/material/IconButton";
// import MenuIcon from "@mui/icons-material/Menu";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import ListIcon from "@mui/icons-material/List";
// import AddIcon from "@mui/icons-material/Add";
// import AppBar from "./views/components/AppBar";
// import Main from "./views/components/Main";
// import DrawerHeader from "./views/components/DrawerHeader";

// import { BrowserRouter, Routes, Route, NavLink } from "react-router";
// import { AppRoutes } from "./routes";
// import React from "react";

// const drawerWidth = 240;

// const App = () => {
//   const [open, setOpen] = React.useState(false);

//   const theme = useTheme();

//   const handleDrawerOpen = () => {
//     setOpen(true);
//   };

//   const handleDrawerClose = () => {
//     setOpen(false);
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       <BrowserRouter>
//         <CssBaseline />
//         <AppBar position="fixed" open={open}>
//           <Toolbar>
//             <IconButton
//               color="inherit"
//               aria-label="open drawer"
//               onClick={handleDrawerOpen}
//               edge="start"
//               sx={[
//                 {
//                   mr: 2
//                 },
//                 open && { display: "none" }
//               ]}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Typography variant="h6" noWrap component="div">
//               Alliance Reactjs Basecode
//             </Typography>
//           </Toolbar>
//         </AppBar>
//         <Drawer
//           sx={{
//             width: drawerWidth,
//             flexShrink: 0,
//             "& .MuiDrawer-paper": {
//               width: drawerWidth,
//               boxSizing: "border-box"
//             }
//           }}
//           variant="persistent"
//           anchor="left"
//           open={open}
//         >
//           <DrawerHeader>
//             <IconButton onClick={handleDrawerClose}>
//               {theme.direction === "ltr" ? (
//                 <ChevronLeftIcon />
//               ) : (
//                 <ChevronRightIcon />
//               )}
//             </IconButton>
//           </DrawerHeader>
//           <Divider />
//           <List>
//             {[
//               { to: "/employee-list", text: "Employee List" },
//               { to: "/employee-add", text: "Employee Form" },
//               { to: "/employee-details", text: "Employee Details" }
//             ].map((item, index) => (
//               <ListItem key={item.text} disablePadding>
//                 <ListItemButton>
//                   <ListItemIcon>
//                     {index % 2 === 0 ? <ListIcon /> : <AddIcon />}
//                   </ListItemIcon>
//                   <NavLink to={item.to}>
//                     <ListItemText primary={item.text} />
//                   </NavLink>
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//         </Drawer>
//         <Main open={open}>
//           <DrawerHeader />
//           <AppRoutes />
//         </Main>
//       </BrowserRouter>
//     </Box>
//   );
// };

// export default App;

import Box from "@mui/material/Box";

import { AppRoutes } from "./routes";

const App = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <AppRoutes />
    </Box>
  );
};

export default App;
