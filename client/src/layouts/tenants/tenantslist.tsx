import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AddBusiness,
} from "@mui/icons-material/";

import { tenantMainData, getTenants } from "../../utils/services";
import { PageTitle } from "../../components/customComponents";

function TenantsList() {
  PageTitle("Clientes");

  const [tenants, setTenants] = useState<tenantMainData[]>([]);

  const loadTenants = async () => {
    const data = await getTenants();
    setTenants(data);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const navigate = useNavigate();

  const [open, setOpen] = useState(-1);
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

              <Box>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                  style={{ marginLeft: ".5rem" }}
                  startIcon={<FormatListBulleted />}
                >
                  Ver detalles
                </Button>

                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(open === tenant.id ? -1 : tenant.id)}
                  style={{ marginLeft: ".5rem" }}
                >
                  {open === tenant.id ? (
                    <KeyboardArrowUp />
                  ) : (
                    <KeyboardArrowDown />
                  )}
                </IconButton>
              </Box>
            </CardContent>

            <Collapse in={open === tenant.id} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography>Info</Typography>
              </CardContent>
            </Collapse>
          </Card>
        ))}
    </Fragment>
  );
}

export default TenantsList;
