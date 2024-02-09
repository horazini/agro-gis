import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

import { useThemeContext } from "./themeContext";

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
  Switch,
  useTheme,
} from "@mui/material";

import { green } from "@mui/material/colors";

import { styled, Theme, CSSObject } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  BrightnessMedium as BrightnessMediumIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Map as MapIcon,
  CalendarMonth as CalendarMonthIcon,
  Layers as LayersIcon,
  Groups as GroupsIcon,
  BarChart as BarChartIcon,
  Agriculture as AgricultureIcon,
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

const routeList = [
  {
    text: "Clientes",
    icon: <StoreIcon />,
    to: "/tenants",
    allowed: [1],
  },
  {
    text: "Reportes",
    icon: <BarChartIcon />,
    to: "/reports",
    allowed: [3],
  },
  {
    text: "Usuarios",
    icon: <GroupsIcon />,
    to: "/users",
    allowed: [2, 3],
  },
  {
    text: "Especies",
    icon: <InventoryIcon />,
    to: "/species",
    allowed: [3, 5, 6],
  },
  {
    text: "Administración de parcelas",
    icon: <LayersIcon />,
    to: "/landplots/management",
    allowed: [3, 4],
  },
  {
    text: "Parcelas y cultivos",
    icon: <MapIcon />,
    to: "/landplots",
    allowed: [3, 4, 6],
  },
  {
    text: "Cultivos",
    icon: <AgricultureIcon />,
    to: "/crops",
    allowed: [3, 6],
  },
  {
    text: "Calendario de tareas",
    icon: <CalendarMonthIcon />,
    to: "/calendar",
    allowed: [3, 6],
  },
];

const SettingsMenu = () => {
  const { theme, toggleTheme } = useThemeContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpen = Boolean(anchorEl);
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <Tooltip title="Preferencia de tema">
        <IconButton
          onClick={handleSettingsClick}
          color="inherit"
          sx={{ ml: 2 }}
          aria-controls={settingsOpen ? "settings-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={settingsOpen ? "true" : undefined}
        >
          <BrightnessMediumIcon sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={settingsOpen}
        onClose={handleSettingsClose}
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
        <MenuItem onClick={toggleTheme}>
          Tema oscuro
          <Switch checked={theme} />
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

const UserMenu = () => {
  const dispatch = useDispatch();
  const { username, surname, names, tenantName } = useSelector(
    (state: RootState) => state.auth
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userOpen = Boolean(anchorEl);
  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserClose = () => {
    setAnchorEl(null);
  };
  const handleSessionClose = async (event: any) => {
    event.preventDefault();
    await dispatch(logout() as any);
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate(`/profile`);
  };

  const handleTenantClick = () => {
    setAnchorEl(null);
    navigate(`/`);
  };

  const navigate = useNavigate();
  return (
    <Fragment>
      <Tooltip title="Usuario">
        <IconButton
          onClick={handleUserClick}
          color="inherit"
          sx={{ ml: 2 }}
          aria-controls={userOpen ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={userOpen ? "true" : undefined}
        >
          <AccountCircleIcon sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={userOpen}
        onClose={handleUserClose}
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
        <MenuItem onClick={handleTenantClick}>
          <ListItemIcon>
            <StoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={tenantName} />
        </MenuItem>
        <MenuItem onClick={handleProfileClick}>
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
};

const ItemButtonsList = ({ open }: { open: boolean }) => {
  const { userTypeId } = useSelector((state: RootState) => state.auth);
  if (userTypeId === null) return <Fragment />;

  const allowedRoutes = routeList.filter((route) =>
    route.allowed.includes(userTypeId || 0)
  );

  return (
    <List>
      {allowedRoutes.map((item, index) => {
        const { text, icon } = item;
        return (
          <ListItemButton component={Link} to={item.to} key={index}>
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

            <ListItemText
              primary={text}
              sx={{
                opacity: open ? 1 : 0,
                whiteSpace: open ? "normal" : "nowrap",
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default function NavbarDrawer() {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = useTheme();
  const backgroundColor =
    theme.palette.mode === "light" ? green[500] : "#121212";

  return (
    <Fragment>
      <Box>
        <CssBaseline />
        <AppBar position="fixed" style={{ backgroundColor }} open={open}>
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
                AgroSense {/* AgTracker */}
              </Link>
            </Typography>

            <SettingsMenu />
            <UserMenu />
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />

          <ItemButtonsList open={open} />
          <Divider />
        </Drawer>
      </Box>
    </Fragment>
  );
}
