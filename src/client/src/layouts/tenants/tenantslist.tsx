import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FormatListBulleted,
  Add,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material/";

import { tenantMainData, getTenants } from "../../services/services";

function TenantsList() {
  const [tenants, setTenants] = useState<tenantMainData[]>([]);

  const loadTenants = async () => {
    const data = await getTenants();
    setTenants(data);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    // Do something
  };

  const [open, setOpen] = useState(-1);
  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Lista de clientes</h1>

        <Button variant="outlined" onClick={() => navigate("/tenants/new")}>
          <Add sx={{ mr: 1 }} />
          Crear nuevo cliente
        </Button>
      </div>

      {tenants
        .filter((tenant) => tenant.id !== 1) // filters systadmin 'tenant'
        .map((tenant) => (
          <Card key={tenant.id} style={{ marginBottom: ".7rem" }}>
            <CardContent
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box>
                <Typography>{tenant.name}</Typography>
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
