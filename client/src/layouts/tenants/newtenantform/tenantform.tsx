import {
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Fragment } from "react";
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
import { DataFetcher, PageTitle } from "../../../components/customComponents";
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

const TenantFormLoader = ({ tenantId }: { tenantId: number }) => {
  const tenantGetter = async () => {
    const data = await getTenantData(tenantId);
    return ["tenantData", data];
  };

  return (
    <DataFetcher getResourceFunctions={[tenantGetter]}>
      {(params) => <TenantForm {...params} editingTenantId={tenantId} />}
    </DataFetcher>
  );
};

const TenantForm = ({
  tenantData,
  editingTenantId,
}: {
  tenantData: any;
  editingTenantId?: number;
}) => {
  const isEditingForm: boolean = editingTenantId !== undefined;

  const orgDataInit = {
    email: tenantData.tenant.email,
    locality: tenantData.tenant.locality,
    name: tenantData.tenant.name,
    phone: tenantData.tenant.phone,
    representatives_names: tenantData.tenant.representatives_names,
    representatives_surname: tenantData.tenant.representatives_surname,
  };

  const userListInit = tenantData.users;

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

const TenantFormMain = () => {
  const params = useParams();

  const tenantId = Number(params.id);

  PageTitle(params.id ? "Editar cliente" : "Nuevo cliente");

  const tenantInitData = {
    tenant: {
      name: "",
      representatives_names: "",
      representatives_surname: "",
      locality: "",
      email: "",
      phone: "",
    },
    users: [],
  };

  return params.id ? (
    <TenantFormLoader tenantId={tenantId} />
  ) : (
    <TenantForm tenantData={tenantInitData} />
  );
};

export default TenantFormMain;
