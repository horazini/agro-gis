import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from "react-router-dom";

function Navbar(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>


          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "#0f64f2" }}>
              IR A INICIO
            </Link>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/species/new")}
          >
            Agregar especie
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
