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
  SelectChangeEvent,
} from "@mui/material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import React, { useState } from "react";

export interface RowData {
  id: number;
  usertype: string;
  username: string;
  mail_address: string;
  surname: string;
  names: string;
}

export type SecondStepProps = {
  usertypes: string[];
  userList: RowData[];
  handleSubmitUser: (usersData: RowData, editingRowId: number | null) => void;
  handleDeleteUser: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
};

const SecondStep = ({
  usertypes,
  userList,
  handleSubmitUser,
  handleDeleteUser,
  onBack,
  onNext,
}: SecondStepProps) => {
  const usertypeslist = Object.values(usertypes).map((item: any) => item.name);

  const [userData, setUserData] = useState<RowData>({
    id: 0,
    username: "",
    usertype: "",
    mail_address: "",
    surname: "",
    names: "",
  });

  const handleFormChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const handleEditRow = (row: RowData) => {
    setUserData(row);
    setEditingRowId(row.id);
  };

  const handleSubmitForm = () => {
    //event.preventDefault();
    handleSubmitUser(userData, editingRowId);
    setUserData({
      id: 0,
      username: "",
      usertype: "",
      mail_address: "",
      surname: "",
      names: "",
    });
    setEditingRowId(null);
  };

  const disableSubmit = () => {
    const { usertype, surname, names, mail_address, username } = userData;
    return !(usertype && surname && names && mail_address && username);
  };

  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidation = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(userData.mail_address);

    const usernameRegex = /^[a-z0-9._]+$/;
    const isValidUsername = usernameRegex.test(userData.username);

    const isUsernameValidLength = userData.username.length >= 6;

    setEmailError(!isValidEmail);
    setUsernameError(!isValidUsername || !isUsernameValidLength);

    if (!isUsernameValidLength) {
      setErrorMessage("El nombre de usuario debe tener al menos 6 caracteres");
    } else if (!isValidUsername) {
      setErrorMessage(
        "El nombre de usuario sólo puede contener letras (a-z), números (0-9), puntos (.) y guiones bajos (_)."
      );
    } else {
      setErrorMessage("");
      if (isValidEmail) {
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de usuario</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Correo electrónico</TableCell>
                  <TableCell>Nombre de usuario</TableCell>
                  <TableCell>Opciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.usertype}</TableCell>
                    <TableCell>{row.surname}</TableCell>
                    <TableCell>{row.names}</TableCell>
                    <TableCell>{row.mail_address}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditRow(row)}>
                        <EditIcon sx={{ mr: 1 }} />
                      </Button>
                      <Button onClick={() => handleDeleteUser(row.id)}>
                        <DeleteIcon sx={{ mr: 1 }} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
              <InputLabel id="demo-simple-select-label">
                Tipo de usuario
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Usertype"
                name="usertype"
                value={userData.usertype}
                onChange={handleFormChange}
              >
                {usertypeslist.map((usertype) => (
                  <MenuItem key={usertype} value={usertype}>
                    {usertype}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Apellido"
              name="surname"
              value={userData.surname}
              onChange={handleFormChange}
            />
            <TextField
              label="Nombres"
              name="names"
              value={userData.names}
              onChange={handleFormChange}
            />
            <TextField
              label="Email"
              name="mail_address"
              value={userData.mail_address}
              onChange={handleFormChange}
              error={emailError}
              helperText={
                emailError ? "El correo electrónico no es válido" : ""
              }
            />
            <TextField
              label="Nombre de usuario"
              name="username"
              value={userData.username}
              onChange={handleFormChange}
              error={usernameError}
              helperText={errorMessage}
            />
            <Button
              type="submit"
              onClick={handleValidation}
              disabled={disableSubmit()} // Habilita o deshabilita el botón según el resultado de la función
            >
              {editingRowId !== null ? "Actualizar" : "Agregar"}
            </Button>
          </TableContainer>
        </Grid>
      </Grid>

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
