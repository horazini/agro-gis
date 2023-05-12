import {
  Container,
  CssBaseline,
  Paper,
  Step,
  StepLabel,
  Stepper,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import bcrypt from "bcryptjs";

import FirstStep from "./firsstep";
import SecondStep from "./secondstep";
import ThirdStep from "./thirdstep";

import { RowData } from "./secondstep";

const theme = createTheme();

const MyForm = () => {
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

  // Obtiene tipos de usuario desde la DB

  const [usertypes, setUsertypes] = useState<any[]>([]);

  const loadUserTypes = async () => {
    const response = await fetch("http://localhost:4000/usertypes");
    const data = await response.json();
    setUsertypes(data);
  };

  useEffect(() => {
    loadUserTypes();
  }, []);

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

  const usertypeslist = Object.values(usertypes)
    .filter((item: any, index: number) => index !== 0)
    .map((item: any) => item.name);

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
      const tenantData = {
        tenant: {
          name: orgData.tenantName,
        },
        users: userList.map((user: any) => {
          const usertype = usertypes.find(
            (type) => type.name === user.usertype
          );
          const password_hash = bcrypt.hashSync(user.username, 10);

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

      const res = await fetch("http://localhost:4000/tenantdata", {
        method: "POST",
        body: JSON.stringify(tenantData),
        headers: { "Content-type": "application/json" },
      });

      console.log(res);
    } catch (error) {
      console.log(error);
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
            usertypes={usertypes}
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default MyForm;
