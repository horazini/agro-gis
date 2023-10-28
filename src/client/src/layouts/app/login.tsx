import * as React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Typography,
  Box,
  Link,
  CircularProgress,
  Paper,
  Container,
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  AlertColor,
} from "@mui/material";

import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { Fragment, useState } from "react";
import { PageTitle, SnackBarAlert } from "../../components/customComponents";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        Nombre aplicación
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn() {
  const dispatch = useDispatch();

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
    } catch (error: any) {
      console.log(error.message);
      if (error.message) {
        handleSnackbarOpen(error.message);
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };

  type MySnackBarProps = {
    open: boolean;
    severity: AlertColor | undefined;
    msg: string;
  };
  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: "error",
    msg: "",
  });

  const handleSnackbarOpen = (error: unknown) => {
    const errors = [
      { key: "Username not found", label: "Usuario no encontrado." },
      {
        key: "Disabled user",
        label: "Usuario deshabilitado. Contáctese con su organización.",
      },
      {
        key: "Disabled tenant",
        label:
          "Organización deshabilitada. Contáctese con los proveedores del servicio.",
      },
      { key: "Invalid credentials", label: "Contraseña incorrecta" },
      { key: "Failed to fetch", label: "No se pudo conectar con el servidor" },
    ];
    const errorMessage = errors.find((e) => e.key === error)?.label;

    if (errorMessage !== undefined) {
      setSnackBar((prevObject) => ({
        ...prevObject,
        open: true,
        msg: errorMessage,
      }));
    } else {
      console.log(error);
    }
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar((prevObject) => ({
      ...prevObject,
      open: false,
    }));
  };

  return (
    <Fragment>
      <Container component="main" maxWidth="sm">
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
      <SnackBarAlert
        handleSnackbarClose={handleSnackbarClose}
        msg={snackBar.msg}
        open={snackBar.open}
        severity={snackBar.severity}
      />
    </Fragment>
  );
}
