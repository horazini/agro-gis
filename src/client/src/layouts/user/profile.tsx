import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  FormControl,
  IconButton,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";

import { Key as KeyIcon, Visibility, VisibilityOff } from "@mui/icons-material";

import {
  getUserData,
  hashFunction,
  resetUserPassword,
  verifyCredentials,
} from "../../utils/services";
import {
  CircularProgressBackdrop,
  DialogComponent,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
} from "../../components/customComponents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { UsertypeIDToString } from "../../utils/functions";
import { user } from "../tenants/userdetails";

const UserLoader = () => {
  PageTitle("Mi perfil");

  const { userId } = useSelector((state: RootState) => state.auth);

  const [userData, setUserData] = useState<user>();

  const loadUser = async (id: number) => {
    try {
      const data = await getUserData(String(id));
      setUserData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUser(userId);
    }
  }, [userId]);

  return <Fragment>{userData && <Profile userData={userData} />} </Fragment>;
};

const Profile = ({ userData }: any) => {
  const { username, surname, names, mail_address, usertype_id } = userData;

  const nullResetPasswordState = {
    prevPassword: "",
    newPassword: "",
    newPasswordCheck: "",
  };

  const [resetPassword, setResetPassword] = useState(nullResetPasswordState);

  const handleFormChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setResetPassword({ ...resetPassword, [name]: value });
  };

  const [prevPasswordError, setPrevPassword] = useState(false);
  const [newPasswordLengthError, setNewPasswordLengthError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [newPasswordCheckError, setNewPasswordCheckError] = useState(false);

  const handleValidation = async () => {
    const { prevPassword, newPassword, newPasswordCheck } = resetPassword;

    const isOldPasswordCorrect = await verifyCredentials(
      username,
      prevPassword
    );

    const isNewPasswordLengthValid = newPassword.length >= 6;
    const newPasswordRegex = /^[A-Za-z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ñÑ]+$/;
    const isNewPasswordRegexValid = newPasswordRegex.test(newPassword);
    const isNewPasswordValid =
      isNewPasswordLengthValid && isNewPasswordRegexValid;

    const isNewPasswordChecked = newPasswordCheck === newPassword;

    setPrevPassword(!isOldPasswordCorrect);
    setNewPasswordLengthError(!isNewPasswordLengthValid);
    setNewPasswordError(!isNewPasswordValid);
    setNewPasswordCheckError(!isNewPasswordChecked);

    if (isOldPasswordCorrect && isNewPasswordValid && isNewPasswordChecked) {
      return true;
    } else {
      return false;
    }
  };

  const [loading, setLoading] = useState(false);

  const successSnackBar: MySnackBarProps = {
    open: true,
    severity: "success",
    msg: "Contraseña actualizada correctamente!",
  };

  const errorSnackBar: MySnackBarProps = {
    open: true,
    severity: "error",
    msg: "Algo ha fallado.",
  };

  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

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

  const handleConfirm = async () => {
    setLoading(true);

    const { prevPassword, newPassword } = resetPassword;
    try {
      const newPasswordHash = hashFunction(newPassword);

      const res = await resetUserPassword(
        userData.id,
        username,
        prevPassword,
        newPasswordHash
      );

      if (res === 200) {
        setSnackBar(successSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
      handleDialogClose();
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  };

  const handleDialogClose = () => {
    setResetPassword(nullResetPasswordState);
    setPrevPassword(false);
    setNewPasswordLengthError(false);
    setNewPasswordError(false);
    setNewPasswordCheckError(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Mi perfil
        </Typography>

        <h2>
          {surname}, {names}
        </h2>
        <h2>nombre de usuario: {username}</h2>
        <h2>Correo: {mail_address}</h2>
        <h2>Rol: {UsertypeIDToString(usertype_id)}</h2>
        <h2>Correo electrónico: {mail_address}</h2>
        <Box
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "end",
          }}
        >
          <DialogComponent
            component={
              <Button variant="contained" color="error" startIcon={<KeyIcon />}>
                Cambiar mi contraseña
              </Button>
            }
            dialogTitle={"Actualizar contraseña"}
            dialogSubtitle={
              <Fragment>
                <PasswordTextfield
                  label={"Contraseña actual"}
                  name={"prevPassword"}
                  value={resetPassword.prevPassword}
                  onChange={handleFormChange}
                  error={prevPasswordError}
                  helperText={"Contraseña incorrecta"}
                />

                <PasswordTextfield
                  label={"Nueva contraseña"}
                  name={"newPassword"}
                  value={resetPassword.newPassword}
                  onChange={handleFormChange}
                  error={newPasswordError}
                  helperText={
                    newPasswordLengthError
                      ? "La contraseña debe tener al menos 6 caracteres"
                      : "Contraseña invalida"
                  }
                />
                <PasswordTextfield
                  label={"Verifique nueva contraseña"}
                  name={"newPasswordCheck"}
                  value={resetPassword.newPasswordCheck}
                  onChange={handleFormChange}
                  error={newPasswordCheckError}
                  helperText={"Las contraseñas no coinciden"}
                />
              </Fragment>
            }
            onClose={handleDialogClose}
            handleValidation={handleValidation}
            onConfirm={handleConfirm}
          />
        </Box>
      </Paper>
      <Fragment>
        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          handleSnackbarClose={handleSnackbarClose}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
    </Container>
  );
};

const PasswordTextfield = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined" error={error}>
      <InputLabel>Contraseña actual</InputLabel>
      <OutlinedInput
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        type={showPassword ? "text" : "password"}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={handleClickShowPassword} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{error ? helperText : null}</FormHelperText>
    </FormControl>
  );
};

export default UserLoader;
