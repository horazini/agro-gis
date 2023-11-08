import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { usernameAlreadyExists } from "../../../utils/services";
import { isValidEmail } from "../../../utils/functions";
import { tenantUserTypes } from "../../../utils/functions";
import { DialogComponent } from "../../../components/customComponents";

export interface RowData {
  id: number;
  usertype_id: number;
  username: string;
  mail_address: string;
  surname: string;
  names: string;
}

export type SecondStepProps = {
  userList: RowData[];
  handleSubmitUser: (usersData: RowData, editingRowId: number | null) => void;
  handleDeleteUser: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
};

const SecondStep = ({
  userList,
  handleSubmitUser,
  handleDeleteUser,
  onBack,
  onNext,
}: SecondStepProps) => {
  const [userData, setUserData] = useState<RowData>({
    id: 0,
    username: "",
    usertype_id: 0,
    mail_address: "",
    surname: "",
    names: "",
  });

  const handleFormChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const handleEditRow = (row: RowData) => {
    setUserData(row);
    setEditingRowId(row.id);
  };

  const clearAllFields = () => {
    setUserData({
      id: 0,
      username: "",
      usertype_id: 0,
      mail_address: "",
      surname: "",
      names: "",
    });
    setEditingRowId(null);
  };

  const handleSubmitForm = () => {
    handleSubmitUser(userData, editingRowId);
    clearAllFields();
  };

  const userDelete = (rowId: number) => {
    handleDeleteUser(rowId);
    clearAllFields();
  };

  const disableSubmit = () => {
    const { usertype_id, surname, names, mail_address, username } = userData;
    return !(usertype_id && surname && names && mail_address && username);
  };

  const disableClean = () => {
    const { usertype_id, surname, names, mail_address, username } = userData;
    return !usertype_id && !surname && !names && !mail_address && !username;
  };

  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidation = async () => {
    // Regex's
    const usernameRegex = /^[a-z0-9._]+$/;

    const isMailValid = isValidEmail(userData.mail_address);
    setEmailError(!isMailValid);

    const isUsernameLengthValid = userData.username.length >= 6;
    const isUsernameRegexValid = usernameRegex.test(userData.username);
    const isUsernameInList: boolean = userList.some(
      (user) => user.username === userData.username && user.id !== editingRowId
    );
    const isUsernameDuplicated =
      (await usernameAlreadyExists(userData.username)) || isUsernameInList;

    setUsernameError(
      !isUsernameRegexValid || !isUsernameLengthValid || isUsernameDuplicated
    );

    const usernameValidationErrors = {
      length: "El nombre de usuario debe tener al menos 6 caracteres.",
      regex:
        "El nombre de usuario sólo puede contener minúsculas (a-z), números (0-9), puntos (.) y guiones bajos (_).",
      duplicate: "El nombre de usuario ya existe.",
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
        handleSubmitForm();
      }
    }
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Usuarios de la organización
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper} style={{ padding: 10 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de usuario</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Correo electrónico</TableCell>
                  <TableCell>Nombre de usuario</TableCell>
                  <TableCell align="center">Opciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userList.length > 0 ? (
                  userList.map((row) => (
                    <TableRow key={row.id} selected={row.id === editingRowId}>
                      <TableCell>
                        {
                          tenantUserTypes.find(
                            (usertype: any) => usertype.id === row.usertype_id
                          )?.name
                        }
                      </TableCell>
                      <TableCell>{row.surname}</TableCell>
                      <TableCell>{row.names}</TableCell>
                      <TableCell>{row.mail_address}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEditRow(row)}
                          size="small"
                        >
                          <EditIcon color="primary" />
                        </IconButton>

                        <DialogComponent
                          component={
                            <IconButton size="small">
                              <DeleteIcon color="primary" />
                            </IconButton>
                          }
                          dialogTitle={"¿Desea eliminar este usuario?"}
                          dialogSubtitle={
                            "Se eliminará al usuario y sus datos de la lista."
                          }
                          onConfirm={() => userDelete(row.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {"Ingrese usuarios"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <br />{" "}
      <Grid container>
        <Grid item xs={12} component={Paper}>
          <Typography variant="h6" sx={{ margin: 1 }}>
            {editingRowId !== null ? "Editar usuario" : "Agregar usuario"}
          </Typography>{" "}
          <Box>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
              <InputLabel id="demo-simple-select-label">
                Tipo de usuario
              </InputLabel>

              <Select
                value={userData.usertype_id}
                onChange={handleFormChange}
                name="usertype_id"
                displayEmpty
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
            </FormControl>
            <br />
            <TextField
              label="Apellido"
              name="surname"
              sx={{ m: 1 }}
              value={userData.surname}
              onChange={handleFormChange}
            />
            <TextField
              label="Nombres"
              name="names"
              sx={{ m: 1 }}
              value={userData.names}
              onChange={handleFormChange}
            />
            <br />
            <TextField
              label="Email"
              name="mail_address"
              sx={{ m: 1 }}
              value={userData.mail_address}
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
            <TextField
              label="Nombre de usuario"
              name="username"
              sx={{ m: 1 }}
              value={userData.username}
              onChange={handleFormChange}
              error={usernameError}
              helperText={errorMessage}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
            />
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                type="submit"
                color="error"
                sx={{ margin: 1 }}
                onClick={clearAllFields}
                disabled={disableClean()}
              >
                {editingRowId !== null ? "Cancelar" : "Limpiar"}
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ margin: 1 }}
                onClick={handleValidation}
                disabled={disableSubmit()}
              >
                {editingRowId !== null ? "Actualizar" : "Agregar"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <br />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button sx={{ mt: 3, ml: 1 }} onClick={onBack}>
          Regresar
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, ml: 1 }}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </Box>
    </React.Fragment>
  );
};

export default SecondStep;
