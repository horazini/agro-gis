import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Add as AddIcon,
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  HowToReg as HowToRegIcon,
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

import {
  disableTenant,
  enableTenant,
  getTenantData,
} from "../../services/services";
import { FormattedArea } from "../../components/mapcomponents";
import { ConfirmDialog } from "../../components/customComponents";
import PageTitle from "../../components/title";

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

const TenantHeader = (tenantInfo: any) => {
  const { id, name, deleted } = tenantInfo;

  const [openDisable, setOpenDisable] = useState(false);
  const [openEnable, setOpenEnsable] = useState(false);

  const handleClickOpenDisable = () => {
    setOpenDisable(true);
  };

  const handleClickOpenEnable = () => {
    setOpenEnsable(true);
  };

  const handleClose = () => {
    setOpenDisable(false);
    setOpenEnsable(false);
  };

  const handleDisableTenant: () => Promise<number> = async () => {
    try {
      return disableTenant(id);
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const handleEnableTenant: () => Promise<number> = async () => {
    try {
      return enableTenant(id);
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  return (
    <Fragment>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>{name}</h1>

        {deleted ? (
          <Button
            startIcon={<HowToRegIcon />}
            variant="contained"
            color="success"
            sx={{ mr: 4 }}
            onClick={handleClickOpenEnable}
          >
            Habilitar
          </Button>
        ) : (
          <Button
            startIcon={<PersonOffIcon />}
            variant="contained"
            color="error"
            sx={{ mr: 4 }}
            onClick={handleClickOpenDisable}
          >
            Inhabilitar
          </Button>
        )}
      </Box>

      <Divider />

      <ConfirmDialog
        open={openDisable}
        handleClose={handleClose}
        msg={
          "Se inhabilitara al cliente, impidiendo el acceso a todos sus usuarios."
        }
        navigateDir={"/tenants/list"}
        onConfirm={handleDisableTenant}
      />

      <ConfirmDialog
        open={openEnable}
        handleClose={handleClose}
        msg={
          "Se habilitara al cliente, devolviendo el acceso a todos sus usuarios."
        }
        navigateDir={"/tenants/list"}
        onConfirm={handleEnableTenant}
      />
    </Fragment>
  );
};

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
        <h3>
          El cliente registra un total de {formattedArea} repartidas en{" "}
          {landplots_number} parcelas.
        </h3>
      ) : (
        <h3> El cliente no registra parcelas. </h3>
      )}
    </Fragment>
  );
};

const SpeciesInfo = (speciesInfo: any) => {
  const { species_number } = speciesInfo;

  return (
    <Fragment>
      <h2>Especies</h2>
      {species_number > 0 ? (
        <h3>El cliente registra un total de {species_number} especies.</h3>
      ) : (
        <h3>El cliente no registra especies. </h3>
      )}
    </Fragment>
  );
};

const CropsInfo = (cropsInfo: any) => {
  const { harvest_number, tons_sum, ongoing_crops_number } = cropsInfo;

  return (
    <Fragment>
      <h2>Producción</h2>
      {harvest_number > 0 ? (
        <h3>
          El cliente registra un total de {harvest_number} cultivos completados,
          sumando {tons_sum} toneladas producidas.
        </h3>
      ) : (
        <h3>El cliente no registra cultivos completados. </h3>
      )}

      {ongoing_crops_number > 0 ? (
        <h3>
          Actualmente cuenta con {ongoing_crops_number} cultivos en marcha.
        </h3>
      ) : (
        <h3>Actualmente no cuenta con cultivos en marcha. </h3>
      )}
    </Fragment>
  );
};

const TenantDetails = () => {
  PageTitle("Cliente");

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
      {TenantHeader(tenantData.tenant)}
      {UserList(tenantData.users)}
      {LandInfo(tenantData.land)}
      {SpeciesInfo(tenantData.species)}
    </Fragment>
  );
};

export default TenantDetails;
