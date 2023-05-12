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
  const usertypeslist = Object.values(usertypes)
    .filter((item: any, index: number) => index !== 0)
    .map((item: any) => item.name);

  const handleFormChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setUsersData({ ...usersData, [name]: value });
  };

  const [usersData, setUsersData] = useState<RowData>({
    id: 0,
    username: "",
    usertype: "",
    mail_address: "",
    surname: "",
    names: "",
  });

  const [selectedOption, setSelectedOption] = useState("");

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const handleEditRow = (row: RowData) => {
    setUsersData(row);
    setEditingRowId(row.id);
  };

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmitUser(usersData, editingRowId);
    setUsersData({
      id: 0,
      username: "",
      usertype: "",
      mail_address: "",
      surname: "",
      names: "",
    });
    setSelectedOption("");
    setEditingRowId(null);
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
            <form onSubmit={handleSubmitForm}>
              <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
                <InputLabel id="demo-simple-select-label">
                  Tipo de usuario
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Usertype"
                  name="usertype"
                  value={usersData.usertype}
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
                value={usersData.surname}
                onChange={handleFormChange}
              />
              <TextField
                label="Nombres"
                name="names"
                value={usersData.names}
                onChange={handleFormChange}
              />
              <TextField
                label="Email"
                name="mail_address"
                value={usersData.mail_address}
                onChange={handleFormChange}
              />
              <TextField
                label="Nombre de usuario"
                name="username"
                value={usersData.username}
                onChange={handleFormChange}
              />
              <Button type="submit">
                {editingRowId !== null ? "Actualizar" : "Agregar"}
              </Button>
            </form>
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
