import * as React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Typography,
  Box,
  Link,
  CircularProgress,
  Paper,
  Container,
  Avatar,
  CssBaseline,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

import PageTitle from "../../components/title";

import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="http://localhost:3000/">
        Nombre aplicación
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme({
  palette: {
    background: {
      default: "#f2f2f2",
    },
    secondary: {
      main: "#ff8419",
    },
  },
});

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  PageTitle("Acceder");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setLoading(true);
      const data = new FormData(event.currentTarget);
      const username = String(data.get("user"));
      const password = String(data.get("password"));
      await dispatch(login({ username, password }) as any);

      navigate("/");
    } catch (error) {
      console.log(error);

      const x: boolean = localStorage.getItem("isAuthenticated") === "true";
      console.log(x);
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Paper
          sx={{
            p: 3,
            paddingLeft: 5,
            paddingRight: 5,
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Acceder
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="user"
              label="Usuario"
              name="user"
              autoComplete="user"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            />

            <Box
              component="span"
              m={1}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              paddingTop={3}
            >
              <Button fullWidth variant="text" sx={{ mt: 3, mb: 2 }}>
                Olvidé mi contraseña
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
