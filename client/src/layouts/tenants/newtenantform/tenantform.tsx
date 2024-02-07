import {
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";

import FirstStep from "./firsstep";
import SecondStep from "./secondstep";
import ThirdStep from "./thirdstep";

import { RowData } from "./secondstep";

import {
  getTenantData,
  hashFunction,
  postTenantData,
  putTenantData,
  tenantDataType,
} from "../../../utils/services";
import { PageTitle } from "../../../components/customComponents";
import { tenantUserTypes } from "../../../utils/functions";
import { useParams } from "react-router-dom";

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
    name: "",
    representatives_surname: "",
    representatives_names: "",
    email: "",
    locality: "",
    phone: "",
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

  /*   const usertypeslist = Object.values(tenantUserTypes).map(
    (item: any) => item.name
  ); */

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

  // Load existing tenant (edit case)

  const params = useParams();

  const [isEditingForm, setIsEditingForm] = useState(false);

  const loadTenant = async (id: string) => {
    try {
      const data = await getTenantData(id);
      const orgDataLoad = {
        email: data.tenant.email,
        locality: data.tenant.locality,
        name: data.tenant.name,
        phone: data.tenant.phone,
        representatives_names: data.tenant.representatives_names,
        representatives_surname: data.tenant.representatives_surname,
      };
      setOrgData(orgDataLoad);
      setUserList(data.users);
      setIsEditingForm(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadTenant(params.id);
    }
  }, [params.id]);

  PageTitle(isEditingForm ? "Editar cliente" : "Nuevo cliente");

  // Confirmar formulario

  const handleConfirm = async () => {
    try {
      if (isEditingForm) {
        const tenantPutData = {
          id: Number(params.id),
          name: orgData.name,
          representatives_names: orgData.representatives_names,
          representatives_surname: orgData.representatives_surname,
          locality: orgData.locality,
          email: orgData.email,
          phone: orgData.phone,
        };

        const res = await putTenantData(tenantPutData);
        return res;
      } else {
        const tenantData: tenantDataType = {
          tenant: {
            name: orgData.name,
            representatives_names: orgData.representatives_names,
            representatives_surname: orgData.representatives_surname,
            locality: orgData.locality,
            email: orgData.email,
            phone: orgData.phone,
          },
          users: userList.map((user: any) => {
            const usertype =
              tenantUserTypes.find((type) => type.id === user.usertype_id) ||
              tenantUserTypes[tenantUserTypes.length - 1];

            const password_hash = hashFunction(user.username);

            return {
              usertype_id: usertype.id,
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
      }
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
            isEditingForm={isEditingForm}
            onConfirm={handleConfirm}
          />
        );
      case 1:
        return (
          <SecondStep
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
          {isEditingForm ? "Editar cliente" : "Nuevo cliente"}
        </Typography>
        {isEditingForm ? (
          <FirstStep
            orgData={orgData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            isEditingForm={isEditingForm}
            onConfirm={handleConfirm}
            tenantId={Number(params.id)}
          />
        ) : (
          <Fragment>
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
          </Fragment>
        )}
      </Paper>
    </Container>
  );
};

export default MyForm;
