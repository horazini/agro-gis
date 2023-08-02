import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

import { getTenantData } from "../../services/services";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
}

interface tenantData {
  tenant: {
    id: number;
    name: string;
  };
  users: user[];
}

function TenantDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const [tenantData, setTenantData] = useState<tenantData>({
    tenant: { id: 0, name: "" },
    users: [],
  });

  const loadTenant = async (id: string) => {
    try {
      const data = await getTenantData(id);
      setTenantData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadTenant(params.id);
    }
  }, [params.id]);

  const [open, setOpen] = useState(-1);
  return (
    <Fragment>
      <h1>{tenantData.tenant.name}</h1>

      <h2>Usuarios</h2>
      {tenantData.users.map((user) => (
        <Card key={user.id} style={{ marginBottom: ".7rem" }}>
          <CardContent
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box>
              <Typography>
                {user.surname}, {user.names}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                color="warning"
                onClick={() => navigate(`/tenants/${user.id}`)}
                style={{ marginLeft: ".5rem" }}
                startIcon={<FormatListBulleted />}
              >
                Ver detalles
              </Button>

              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(open === user.id ? -1 : user.id)}
                style={{ marginLeft: ".5rem" }}
              >
                {open === user.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Box>
          </CardContent>

          <Collapse in={open === user.id} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography>Info</Typography>
            </CardContent>
          </Collapse>
        </Card>
      ))}
    </Fragment>
  );
}

export default TenantDetails;
