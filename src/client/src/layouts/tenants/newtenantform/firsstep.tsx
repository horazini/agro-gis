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
import { isValidEmail } from "../../../utils/functions";
import {
  CancelButton,
  ConfirmButton,
} from "../../../components/customComponents";
import { tenantNameAlreadyExists } from "../../../utils/services";

export type FirstStepProps = {
  orgData: {
    name: string;
    representatives_surname: string;
    representatives_names: string;
    email: string;
    locality: string;
    phone: string;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isEditingForm: boolean;
  onConfirm: () => Promise<number>;
  tenantId?: number;
};

const FirstStep = ({
  orgData,
  handleInputChange,
  onNext,
  isEditingForm,
  onConfirm,
  tenantId,
}: FirstStepProps) => {
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

  const [tenantNameError, setTenantNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleValidation = async () => {
    const isTenantDuplicated = await tenantNameAlreadyExists(orgData.name);
    const isMailValid = isValidEmail(orgData.email);

    setEmailError(!isMailValid);
    setTenantNameError(isTenantDuplicated);

    if (isMailValid && !isTenantDuplicated) {
      onNext();
    }
  };

  const handleConfirmEditFormValidation = async () => {
    const isTenantDuplicated = await tenantNameAlreadyExists(
      orgData.name,
      tenantId
    );
    const isMailValid = isValidEmail(orgData.email);

    setEmailError(!isMailValid);
    setTenantNameError(isTenantDuplicated);

    if (isMailValid && !isTenantDuplicated) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <React.Fragment>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6">Organización</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            inputProps={{ maxLength: 100 }}
            id="name"
            name="name"
            label="Nombre de la organización"
            fullWidth
            variant="standard"
            value={orgData.name}
            onChange={handleInputChange}
            error={tenantNameError}
            helperText={
              tenantNameError ? "El nombre de cliente ya está en uso" : ""
            }
          />
        </Grid>

        <Grid item xs={12} mt={3}>
          <Typography variant="h6">Representante</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="surname"
            name="representatives_surname"
            label="Apellido del representante"
            fullWidth
            variant="standard"
            value={orgData.representatives_surname}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="names"
            name="representatives_names"
            label="Nombres del representante"
            fullWidth
            variant="standard"
            value={orgData.representatives_names}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} mt={3}>
          <Typography variant="h6">Datos de contacto</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="locality"
            name="locality"
            label="Localidad"
            fullWidth
            variant="standard"
            value={orgData.locality}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 20 }}
            id="phone"
            name="phone"
            label="Número de teléfono"
            fullWidth
            onKeyDown={(e) => {
              if (
                !(
                  e.key === "0" ||
                  e.key === "1" ||
                  e.key === "2" ||
                  e.key === "3" ||
                  e.key === "4" ||
                  e.key === "5" ||
                  e.key === "6" ||
                  e.key === "7" ||
                  e.key === "8" ||
                  e.key === "9" ||
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "Tab"
                )
              ) {
                e.preventDefault();
              }
            }}
            variant="standard"
            value={orgData.phone}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            inputProps={{ maxLength: 50 }}
            id="mailAddress"
            name="email"
            label="Correo electrónico"
            fullWidth
            variant="standard"
            value={orgData.email}
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
        <CancelButton navigateDir="/tenants/list" />
        {isEditingForm ? (
          <ConfirmButton
            handleValidation={handleConfirmEditFormValidation}
            msg={"Se modificarán los datos del cliente"}
            onConfirm={onConfirm}
            navigateDir={"/tenants/list"}
            disabled={false}
          />
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, ml: 1 }}
            disabled={!Object.values(orgData).every((value) => !!value)}
            onClick={handleValidation}
          >
            Siguiente
          </Button>
        )}
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
