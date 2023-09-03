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
import { FormattedArea } from "../../components/mapcomponents";

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
  land: {
    landplots_number: number;
    areas_sum: number;
  };
  species: {
    species_number: number;
  };
}

const UserList = (users: user[]) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(-1);

  return (
    <Fragment>
      <h2>Usuarios</h2>
      {users.length > 0 ? (
        <Fragment>
          {users.map((user) => (
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
                    disabled
                    variant="contained"
                    color="warning"
                    /* onClick={() => navigate(`/tenants/${user.id}`)} */
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
                    {open === user.id ? (
                      <KeyboardArrowUp />
                    ) : (
                      <KeyboardArrowDown />
                    )}
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
      ) : (
        <h3> El cliente no registra usuarios. </h3>
      )}
    </Fragment>
  );
};

const LandInfo = (landplotinfo: any) => {
  const { landplots_number, areas_sum } = landplotinfo;

  const formattedArea = FormattedArea(areas_sum);

  return (
    <Fragment>
      <h2>Terreno</h2>
      {landplotinfo.landplots_number > 0 ? (
        <Fragment>
          <h3>
            {" "}
            El cliente registra un total de {formattedArea} repartidas en{" "}
            {landplots_number} parcelas.{" "}
          </h3>
        </Fragment>
      ) : (
        <h3> El cliente no registra parcelas. </h3>
      )}
    </Fragment>
  );
};

const speciesInfo = (speciesInfo: any) => {
  const { species_number } = speciesInfo;

  return (
    <Fragment>
      <h2>Especies</h2>
      {species_number > 0 ? (
        <Fragment>
          <h3>El cliente registra un total de {species_number} especies.</h3>
        </Fragment>
      ) : (
        <h3> El cliente no registra especies. </h3>
      )}
    </Fragment>
  );
};

const TenantDetails = () => {
  const params = useParams();

  const [tenantData, setTenantData] = useState<tenantData>({
    tenant: { id: 0, name: "" },
    users: [],
    land: { landplots_number: 0, areas_sum: 0 },
    species: { species_number: 0 },
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

  return (
    <Fragment>
      <h1>{tenantData.tenant.name}</h1>

      {UserList(tenantData.users)}
      {LandInfo(tenantData.land)}
      {speciesInfo(tenantData.species)}
    </Fragment>
  );
};

export default TenantDetails;
