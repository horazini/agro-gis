import {
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { useState } from "react";

import FirstStep from "./firsstep";
import SecondStep from "./secondstep";
import ThirdStep from "./thirdstep";

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

export type OrgData = {
  name: string;
  representatives_surname: string;
  representatives_names: string;
  email: string;
  locality: string;
  phone: string;
};

export type UserData = {
  id: number;
  usertype_id: number;
  username: string;
  mail_address: string;
  surname: string;
  names: string;
};

const TenantFormLoader = () => {
  const [orgData, setOrgData] = useState<OrgData>({
    name: "",
    representatives_surname: "",
    representatives_names: "",
    email: "",
    locality: "",
    phone: "",
  });

  const [userList, setUserList] = useState<UserData[]>([]);

  const [isEditingForm, setIsEditingForm] = useState(false);

  // Load existing tenant (edit case)

  const params = useParams();

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

  return (
    <TenantForm
      orgDataInit={orgData}
      userListInit={userList}
      isEditingForm={isEditingForm}
      editingTenantId={Number(params.id)}
    />
  );
};

const TenantForm = ({
  orgDataInit,
  userListInit,
  isEditingForm,
  editingTenantId,
}: {
  orgDataInit: OrgData;
  userListInit: UserData[];
  isEditingForm: boolean;
  editingTenantId: number;
}) => {
  useEffect(() => {
    setOrgData(orgDataInit);
    setUserList(userListInit);
  }, [orgDataInit, userListInit]);

  // Tenant org data

  const [orgData, setOrgData] = useState(orgDataInit);

  // Tenant users

  const [userList, setUserList] = useState<UserData[]>(userListInit);

  // Form confirm

  const handleConfirm = async () => {
    try {
      if (isEditingForm) {
        const tenantPutData = {
          id: editingTenantId,
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

  // Form Steps handling

  const [activeStep, setActiveStep] = useState(0);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FirstStep
            orgData={orgData}
            setOrgData={setOrgData}
            onNext={handleNext}
            isEditingForm={isEditingForm}
            onConfirm={handleConfirm}
          />
        );
      case 1:
        return (
          <SecondStep
            userList={userList}
            setUserList={setUserList}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ThirdStep
            formData={orgData}
            userList={userList}
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
            setOrgData={setOrgData}
            onNext={handleNext}
            isEditingForm={isEditingForm}
            onConfirm={handleConfirm}
            tenantId={editingTenantId}
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

export default TenantFormLoader;
