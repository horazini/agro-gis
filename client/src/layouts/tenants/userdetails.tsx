import { Box, Button, Divider } from "@mui/material";
import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  PersonOff as PersonOffIcon,
  HowToReg as HowToRegIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { disableUser, enableUser, getUserData } from "../../utils/services";
import {
  ConfirmFetchAndRedirect,
  DataFetcher,
  PageTitle,
} from "../../components/customComponents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { UsertypeIDToString } from "../../utils/functions";

export type user = {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
};

const UserLoader = () => {
  const params = useParams();
  PageTitle("Usuario");

  const userId = Number(params.id);

  const userGetter = async () => {
    const data = await getUserData(userId);
    return ["userData", data];
  };

  return (
    <DataFetcher getResourceFunctions={[userGetter]}>
      {(params) => <UserDetails {...params} />}
    </DataFetcher>
  );
};

const UserDetails = ({ userData }: any) => {
  const { userId } = useSelector((state: RootState) => state.auth);

  const { id, usertype_id, mail_address, username, names, surname, deleted } =
    userData;

  const handleDisableUser: () => Promise<number> = async () => {
    try {
      return disableUser(id);
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const handleEnableUser: () => Promise<number> = async () => {
    try {
      return enableUser(id);
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
        <h1>
          {surname}, {names}
        </h1>

        <Box>
          <Button
            disabled={id === userId}
            startIcon={<EditIcon />}
            variant="contained"
            sx={{ mr: 2 }}
            onClick={() => navigate(`/users/${id}/edit`)}
          >
            Editar
          </Button>

          <ConfirmFetchAndRedirect
            component={
              <Button
                disabled={id === userId}
                startIcon={deleted ? <HowToRegIcon /> : <PersonOffIcon />}
                variant="contained"
                color={deleted ? "success" : "error"}
                sx={{ mr: 2 }}
              >
                {deleted ? "Habilitar" : "Inhabilitar"}
              </Button>
            }
            disabled={id === userId}
            msg={
              deleted
                ? "Se habilitará al usuario, devolviendo el acceso al servicio."
                : "Se inhabilitará al usuario, impidiendo su acceso al servicio."
            }
            navigateDir={"/users"}
            onConfirm={deleted ? handleEnableUser : handleDisableUser}
          />
        </Box>
      </Box>

      <Divider />

      <h2>Rol: {UsertypeIDToString(usertype_id)}</h2>
      <h2>Nombre de usuario: {username}</h2>
      <h2>Correo electrónico: {mail_address}</h2>
    </Fragment>
  );
};

export default UserLoader;
