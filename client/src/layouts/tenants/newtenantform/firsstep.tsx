import { Typography, Grid, TextField, Box, Button } from "@mui/material";
import React, { useState } from "react";

import { OrgData } from "./tenantform";
import { isValidEmail } from "../../../utils/functions";
import {
  CancelButton,
  ConfirmButton,
} from "../../../components/customComponents";
import { tenantNameAlreadyExists } from "../../../utils/services";

export type FirstStepProps = {
  orgData: OrgData;
  setOrgData: React.Dispatch<React.SetStateAction<OrgData>>;
  onNext: () => void;
  isEditingForm: boolean;
  onConfirm: () => Promise<number>;
  tenantId?: number;
};

const FirstStep = ({
  orgData,
  setOrgData,
  onNext,
  isEditingForm,
  onConfirm,
  tenantId,
}: FirstStepProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOrgData((prevState) => ({ ...prevState, [name]: value }));
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
        <CancelButton navigateDir="/tenants" />
        {isEditingForm ? (
          <ConfirmButton
            handleValidation={handleConfirmEditFormValidation}
            msg={"Se modificarán los datos del cliente"}
            onConfirm={onConfirm}
            navigateDir={"/tenants"}
            disabled={!Object.values(orgData).every((value) => !!value)}
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
    </React.Fragment>
  );
};

export default FirstStep;
