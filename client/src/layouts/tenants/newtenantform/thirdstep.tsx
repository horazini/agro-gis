import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { UserData } from "./tenantform";
import { tenantUserTypes } from "../../../utils/functions";
import { ConfirmButton } from "../../../components/customComponents";

export type ThirdStepProps = {
  formData: {
    name: string;
    representatives_names: string;
    representatives_surname: string;
    locality: string;
    email: string;
    phone: string | number;
  };
  userList: UserData[];
  onBack: () => void;
  onConfirm: () => Promise<number>;
};

const ThirdStep = ({
  formData,
  userList,
  onBack,
  onConfirm,
}: ThirdStepProps) => {
  const usersSummary: {
    usertypename: string;
    total: number;
  }[] = tenantUserTypes.map((usertype) => {
    const total = userList.filter(
      (user) => user.usertype_id === usertype.id
    ).length;
    const usertypename = usertype.name;
    return { usertypename, total };
  });
  usersSummary.push({ usertypename: "Total", total: userList.length });

  const msg: string =
    "Se darán de alta al cliente y todos los usuarios cargados.";

  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom>
        Cliente “{formData.name}”
      </Typography>
      <Typography variant="h6" gutterBottom>
        Administrador: {formData.representatives_surname},{" "}
        {formData.representatives_names}
        <br />
        Email: {formData.email}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Resumen de usuarios:
      </Typography>
      {usersSummary.map((row) => (
        <Typography key={row.usertypename} variant="h6" gutterBottom>
          {row.usertypename}: {row.total}
        </Typography>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button sx={{ mt: 3, ml: 1 }} onClick={onBack}>
          Regresar
        </Button>
        <ConfirmButton
          msg={msg}
          onConfirm={onConfirm}
          navigateDir={"/tenants"}
        />
      </Box>
    </React.Fragment>
  );
};

export default ThirdStep;
