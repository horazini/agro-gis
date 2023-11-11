import { Box, Button, Divider } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  PersonOff as PersonOffIcon,
  HowToReg as HowToRegIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import {
  disableTenant,
  enableTenant,
  getTenantData,
} from "../../utils/services";
import { FormattedArea } from "../../components/mapcomponents";
import {
  ConfirmFetchAndRedirect,
  PageTitle,
} from "../../components/customComponents";
import { formatedDate } from "../../utils/functions";
import { UserCard } from "./userlist";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
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
  const {
    id,
    name,
    deleted,
    created,
    representatives_surname,
    representatives_names,
    email,
    phone,
    locality,
  } = tenantInfo;

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
        <h1>{name}</h1>

        <Box>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            sx={{ mr: 2 }}
            onClick={() => navigate(`/tenants/${id}/edit`)}
          >
            Editar
          </Button>

          <ConfirmFetchAndRedirect
            component={
              <Button
                startIcon={deleted ? <HowToRegIcon /> : <PersonOffIcon />}
                variant="contained"
                color={deleted ? "success" : "error"}
                sx={{ mr: 2 }}
              >
                {deleted ? "Habilitar" : "Inhabilitar"}
              </Button>
            }
            msg={
              deleted
                ? "Se habilitará al cliente, devolviendo el acceso a todos sus usuarios."
                : "Se inhabilitará al cliente, impidiendo el acceso a todos sus usuarios."
            }
            navigateDir={"/tenants"}
            onConfirm={deleted ? handleEnableTenant : handleDisableTenant}
          />
        </Box>
      </Box>

      <Divider />

      <Box>
        <h3>
          Localidad: {locality}
          <br />
          Representante: {representatives_surname}, {representatives_names}
          <br />
          Correo electrónico: {email}
          <br />
          Número de teléfono: {phone}
          <br />
          Adquisición del servicio: {formatedDate(created)}
        </h3>
      </Box>
    </Fragment>
  );
};

const UserList = (users: user[]) => {
  return (
    <Fragment>
      <h2>Usuarios</h2>
      {users.length > 0 ? (
        <Fragment>
          {users.map((user) => (
            <UserCard user={user} />
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
