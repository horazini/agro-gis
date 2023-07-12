import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

import {
  Box,
  CssBaseline,
  IconButton,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";

import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Map as MapIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const itemsList = [
  {
    text: "Clientes",
    icon: <GroupIcon />,
    to: "/tenants/list",
  },

  {
    text: "Especies",
    icon: <InventoryIcon />,
    to: "/species/list",
  },
  {
    text: "Parcelas",
    icon: <MapIcon />,
    to: "/map",
  },
  {
    text: "Agregar parcelas",
    icon: <MapIcon />,
    to: "/map2",
  },
  {
    text: "Alta de cultivos",
    icon: <MapIcon />,
    to: "/cropregister",
  },
];

export default function NavbarDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userOpen = Boolean(anchorEl);
  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserClose = () => {
    setAnchorEl(null);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSessionClose = async (event: any) => {
    event.preventDefault();
    await dispatch(logout() as any);
    navigate("/login");
  };

  const { username, surname, names } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Fragment>
      <Box>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1 }}
              noWrap
              component="div"
            >
              <Link to="/" style={{ textDecoration: "none", color: "white" }}>
                IR A INICIO
              </Link>
            </Typography>

            <Tooltip title="Ajustes">
              <IconButton
                color="inherit"
                //onClick={handleClick}
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <SettingsIcon sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Usuario">
              <IconButton
                onClick={handleUserClick}
                color="inherit"
                //onClick={handleClick}
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <AccountCircleIcon sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />

          <List>
            {itemsList.map((item, index) => {
              const { text, icon } = item;
              return (
                <ListItemButton component={Link} to={item.to} key={text}>
                  {icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {icon}
                    </ListItemIcon>
                  )}

                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              );
            })}
          </List>
          <Divider />
        </Drawer>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={userOpen}
        onClose={handleUserClose}
        onClick={handleUserClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleUserClose}>
          <Avatar />
          <ListItemText primary={`${names} ${surname}`} secondary={username} />
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleSessionClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </Fragment>
  );
}
