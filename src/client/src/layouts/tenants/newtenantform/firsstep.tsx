import {
  Typography,
  Grid,
  TextField,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "../../../components/customComponents";

export type FirstStepProps = {
  orgData: {
    tenantName: string;
    adminSurname: string;
    adminNames: string;
    adminMailAddress: string;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
};

const FirstStep = ({ orgData, handleInputChange, onNext }: FirstStepProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    navigate("/tenants/list");
  };

  const [emailError, setEmailError] = useState(false);

  const handleValidation = () => {
    const isMailValid = isValidEmail(orgData.adminMailAddress);

    if (!isMailValid) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    onNext();
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Organización
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            inputProps={{ maxLength: 100 }}
            id="tenantName"
            name="tenantName"
            label="Nombre de la organización"
            fullWidth
            variant="standard"
            value={orgData.tenantName}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
      <br />
      <Typography variant="h6" gutterBottom>
        Administrador
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="surname"
            name="adminSurname"
            label="Apellido"
            fullWidth
            variant="standard"
            value={orgData.adminSurname}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="names"
            name="adminNames"
            label="Nombres"
            fullWidth
            variant="standard"
            value={orgData.adminNames}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 100 }}
            id="mailAddress"
            name="adminMailAddress"
            label="Correo electrónico"
            fullWidth
            variant="standard"
            value={orgData.adminMailAddress}
            onChange={handleInputChange}
            error={emailError}
            helperText={emailError ? "El correo electrónico no es válido" : ""}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, ml: 1 }}
          onClick={handleClickOpen}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, ml: 1 }}
          disabled={!Object.values(orgData).every((value) => !!value)}
          onClick={handleValidation}
        >
          Siguiente
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Cancelar carga?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Los datos ingresados no serán guardados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Quedarme aquí</Button>
          <Button onClick={handleCancel} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default FirstStep;
