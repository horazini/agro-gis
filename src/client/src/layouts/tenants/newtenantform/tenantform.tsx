import {
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import bcrypt from "bcryptjs";

import FirstStep from "./firsstep";
import SecondStep from "./secondstep";
import ThirdStep from "./thirdstep";

import { RowData } from "./secondstep";

import {
  hashFunction,
  postTenantData,
  tenantDataType,
} from "../../../utils/services";
import { PageTitle } from "../../../components/customComponents";
import { tenantUserTypes } from "../../../utils/functions";

const MyForm = () => {
  PageTitle("Nuevo cliente");

  // Pasos del formulario

  const [activeStep, setActiveStep] = useState(0);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Datos de la organizacion

  const [orgData, setOrgData] = useState({
    tenantName: "",
    adminSurname: "",
    adminNames: "",
    adminMailAddress: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setOrgData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Usuarios de la organizacion

  const [userList, setUserList] = useState<RowData[]>([]);

  const handleSubmitUser = (
    usersData: RowData,
    editingRowId: number | null
  ) => {
    if (editingRowId !== null) {
      setUserList((prevRows) =>
        prevRows.map((row) => (row.id === editingRowId ? usersData : row))
      );
    } else {
      setUserList((prevRows) => [
        ...prevRows,
        {
          ...usersData,
          id:
            prevRows.length === 0
              ? 1
              : Math.max(...prevRows.map((row) => row.id)) + 1,
        },
      ]);
    }
  };

  const handleDeleteUser = (id: number) => {
    setUserList((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const usertypeslist = Object.values(tenantUserTypes).map(
    (item: any) => item.name
  );

  const usersSummary: {
    usertype: string;
    total: number;
  }[] = usertypeslist.map((usertype) => {
    const total = userList.filter((user) => user.usertype === usertype).length;
    return { usertype, total };
  });
  usersSummary.push({ usertype: "Total", total: userList.length });

  // Confirmar formulario

  const handleConfirm = async () => {
    try {
      const tenantData: tenantDataType = {
        tenant: {
          name: orgData.tenantName,
        },
        users: userList.map((user: any) => {
          const usertype =
            tenantUserTypes.find((type) => type.name === user.usertype) ||
            userList[0];

          const password_hash = hashFunction(user.username);

          return {
            usertype_id: usertype?.id,
            mail_address: user.mail_address,
            username: user.username,
            names: user.names,
            surname: user.surname,
            password_hash,
          };
        }),
      };

      const res = await postTenantData(tenantData);
      return res;
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  // Pasos

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FirstStep
            orgData={orgData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <SecondStep
            usertypes={tenantUserTypes}
            userList={userList}
            handleSubmitUser={handleSubmitUser}
            handleDeleteUser={handleDeleteUser}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ThirdStep
            formData={orgData}
            usersSummary={usersSummary}
            onBack={handleBack}
            onConfirm={handleConfirm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Nuevo cliente
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          <Step>
            <StepLabel>Organización</StepLabel>
          </Step>
          <Step>
            <StepLabel>Usuarios</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmar datos</StepLabel>
          </Step>
        </Stepper>
        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default MyForm;