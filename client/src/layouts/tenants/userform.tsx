import {
  Box,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserData,
  hashFunction,
  postUser,
  putUser,
  usernameAlreadyExists,
} from "../../utils/services";
import {
  CancelButton,
  ConfirmButton,
  DataFetcher,
  PageTitle,
} from "../../components/customComponents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { isValidEmail, tenantUserTypes } from "../../utils/functions";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
}

const UserFormLoader = ({ userId }: { userId: number }) => {
  const userGetter = async () => {
    const data: user = await getUserData(userId);
    return ["userInitData", data];
  };

  return (
    <DataFetcher getResourceFunctions={[userGetter]}>
      {(params) => <UserForm {...params} isEditingForm />}
    </DataFetcher>
  );
};

const UserForm = ({
  userInitData,
  isEditingForm = false,
}: {
  userInitData: user;
  isEditingForm?: boolean;
}) => {
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [userData, setUserData] = useState(userInitData);

  const { id, usertype_id, mail_address, username, names, surname } = userData;

  const handleFormChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidation = async () => {
    // Regex's
    const usernameRegex = /^[a-z0-9._]+$/;

    const isMailValid = isValidEmail(mail_address);
    setEmailError(!isMailValid);

    const isUsernameLengthValid = username.length >= 6;
    const isUsernameRegexValid = usernameRegex.test(username);
    const isUsernameDuplicated = await usernameAlreadyExists(username, id);

    setUsernameError(
      !isUsernameRegexValid || !isUsernameLengthValid || isUsernameDuplicated
    );

    const usernameValidationErrors = {
      length: "El nombre de usuario debe tener al menos 6 caracteres.",
      regex:
        "El nombre de usuario sólo puede contener minúsculas (a-z), números (0-9), puntos (.) y guiones bajos (_).",
      duplicate: "El nombre de usuario ya está en uso.",
    };

    if (!isUsernameLengthValid) {
      setErrorMessage(usernameValidationErrors.length);
    } else if (!isUsernameRegexValid) {
      setErrorMessage(usernameValidationErrors.regex);
    } else if (isUsernameDuplicated) {
      setErrorMessage(usernameValidationErrors.duplicate);
    } else {
      setErrorMessage("");
      if (isMailValid) {
        return true;
      }
    }
    return false;
  };

  const handleSubmitForm = async () => {
    if (isEditingForm) {
      const sentUserData = { ...userData };
      const res = await putUser(sentUserData);
      return res;
    } else {
      const password_hash = hashFunction(userData.username);
      const sentUserData = { ...userData, password_hash, tenant_id: tenantId };
      const res = await postUser(sentUserData);
      return res;
    }
  };

  return (
    <Fragment>
      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            {isEditingForm ? "Editar usuario" : "Crear nuevo usuario"}
          </Typography>
          <br />
          <Divider />

          <Paper
            variant="outlined"
            component={Paper}
            sx={{ mt: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
                  <Typography mr={1}>{"Rol: "}</Typography>

                  <Select
                    value={usertype_id}
                    onChange={handleFormChange}
                    name="usertype_id"
                    displayEmpty
                    variant="standard"
                  >
                    <MenuItem value="0" disabled>
                      Seleccione un rol
                    </MenuItem>
                    {tenantUserTypes.map((usertype) => (
                      <MenuItem key={usertype.id} value={usertype.id}>
                        {usertype.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
                  <Typography mr={1}>{"Nombre de usuario: "}</Typography>

                  <TextField
                    name="username"
                    variant="standard"
                    inputProps={{ maxLength: 50 }}
                    value={username}
                    onChange={handleFormChange}
                    error={usernameError}
                    helperText={errorMessage}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                </Box>

                <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
                  <Typography mr={1}>{"Correo electrónico: "}</Typography>

                  <TextField
                    name="mail_address"
                    variant="standard"
                    inputProps={{ maxLength: 100 }}
                    value={mail_address}
                    onChange={handleFormChange}
                    error={emailError}
                    helperText={
                      emailError ? "El correo electrónico no es válido" : ""
                    }
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                </Box>

                <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
                  <Typography mr={1}>{"Apellido: "}</Typography>

                  <TextField
                    name="surname"
                    variant="standard"
                    inputProps={{ maxLength: 50 }}
                    value={surname}
                    onChange={handleFormChange}
                  />
                </Box>

                <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
                  <Typography mr={1}>{"Nombres: "}</Typography>

                  <TextField
                    name="names"
                    variant="standard"
                    inputProps={{ maxLength: 50 }}
                    value={names}
                    onChange={handleFormChange}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <CancelButton
                navigateDir={isEditingForm ? `/users/${id}` : `/users`}
              />
              <ConfirmButton
                msg={
                  isEditingForm
                    ? "Se actualizará al usuario."
                    : "Se dará de alta al usaurio"
                }
                handleValidation={handleValidation}
                onConfirm={handleSubmitForm}
                navigateDir={tenantId === 1 ? "/tenants" : "/users"}
                disabled={
                  !(usertype_id && surname && names && mail_address && username)
                }
              />
            </Box>
          </Paper>
        </Paper>
      </Container>
    </Fragment>
  );
};

const UserFormMain = () => {
  const params = useParams();

  const userId = Number(params.id);

  PageTitle(params.id ? "Editar usuario" : "Agregar usuario");

  const userInitData: user = {
    id: 0,
    usertype_id: 0,
    mail_address: "",
    username: "",
    names: "",
    surname: "",
    deleted: false,
  };

  return params.id ? (
    <UserFormLoader userId={userId} />
  ) : (
    <UserForm userInitData={userInitData} />
  );
};

export default UserFormMain;
