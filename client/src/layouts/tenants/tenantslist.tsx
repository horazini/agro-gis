import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { FormatListBulleted, AddBusiness } from "@mui/icons-material/";

import { tenantMainData, getTenants } from "../../utils/services";
import { DataFetcher, PageTitle } from "../../components/customComponents";

const TenantsListLoader = () => {
  PageTitle("Clientes");

  const tenantsGetter = async () => {
    const data = await getTenants();
    return ["tenants", data];
  };

  return (
    <DataFetcher getResourceFunctions={[tenantsGetter]}>
      {(params) => <TenantsList {...params} />}
    </DataFetcher>
  );
};

const TenantsList = ({ tenants }: { tenants: tenantMainData[] }) => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Lista de clientes</h1>

        <Button variant="outlined" onClick={() => navigate("/tenants/new")}>
          <AddBusiness sx={{ mr: 1 }} />
          Crear nuevo cliente
        </Button>
      </Box>

      {tenants
        .filter((tenant) => tenant.id !== 1) // filters systadmin 'tenant'
        .map((tenant) => (
          <Card key={tenant.id} style={{ marginBottom: ".7rem" }}>
            <CardContent
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box fontStyle={{ display: "flex" }}>
                <Typography>{tenant.name}</Typography>
                {tenant.deleted === true ? (
                  <Fragment>
                    <Typography style={{ marginLeft: 10 }}>•</Typography>
                    <Chip
                      label="INHABILITADO"
                      variant="outlined"
                      color="error"
                      size="small"
                      style={{ marginLeft: 10 }}
                    />
                  </Fragment>
                ) : null}
              </Box>

              <Button
                variant="contained"
                color="warning"
                onClick={() => navigate(`/tenants/${tenant.id}`)}
                style={{ marginLeft: ".5rem" }}
                startIcon={<FormatListBulleted />}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>
        ))}
    </Fragment>
  );
};

export default TenantsListLoader;
