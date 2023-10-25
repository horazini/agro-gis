import { Box, Button, Typography } from "@mui/material";
import React from "react";

import { ConfirmButton } from "../../../components/customComponents";

export type ThirdStepProps = {
  formData: {
    tenantName: string;
    adminSurname: string;
    adminNames: string;
    adminMailAddress: string;
  };
  usersSummary: {
    usertype: string;
    total: number;
  }[];
  onBack: () => void;
  onConfirm: () => Promise<number>;
};

const ThirdStep = ({
  formData,
  usersSummary,
  onBack,
  onConfirm,
}: ThirdStepProps) => {
  const msg: string =
    "Se darán de alta al cliente y todos los usuarios cargados.";

  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom>
        Cliente “{formData.tenantName}”
      </Typography>
      <Typography variant="h6" gutterBottom>
        Administrador: {formData.adminSurname}, {formData.adminNames}
        <br />
        Email: {formData.adminMailAddress}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Resumen de usuarios:
      </Typography>
      {usersSummary.map((row) => (
        <Typography key={row.usertype} variant="h6" gutterBottom>
          {row.usertype}: {row.total}
        </Typography>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button sx={{ mt: 3, ml: 1 }} onClick={onBack}>
          Regresar
        </Button>
        <ConfirmButton
          msg={msg}
          onConfirm={onConfirm}
          navigateDir={"/tenants/list"}
          disabled={false}
        />
      </Box>
    </React.Fragment>
  );
};

export default ThirdStep;
