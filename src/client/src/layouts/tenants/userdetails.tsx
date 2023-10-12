import { Box, Button, Divider } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  PersonOff as PersonOffIcon,
  HowToReg as HowToRegIcon,
} from "@mui/icons-material";

import { disableUser, enableUser, getUserData } from "../../services/services";
import {
  ConfirmDialog,
  UsertypeIDToString,
} from "../../components/customComponents";
import PageTitle from "../../components/title";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
}

const UserLoader = () => {
  const params = useParams();
  PageTitle("Cliente");

  const [userData, setUserData] = useState<user>();

  const loadTenant = async (id: string) => {
    try {
      const data = await getUserData(id);
      setUserData(data);
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
    <Fragment>{userData && <UserDetails userData={userData} />} </Fragment>
  );
};

const UserDetails = ({ userData }: any) => {
  const { userId } = useSelector((state: RootState) => state.auth);

  const { id, usertype_id, mail_address, username, names, surname, deleted } =
    userData;

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

        {deleted ? (
          <Button
            disabled={id === userId}
            startIcon={<HowToRegIcon />}
            variant="contained"
            color="success"
            sx={{ mr: 2 }}
            onClick={handleClickOpenEnable}
          >
            Habilitar
          </Button>
        ) : (
          <Button
            disabled={id === userId}
            startIcon={<PersonOffIcon />}
            variant="contained"
            color="error"
            sx={{ mr: 2 }}
            onClick={handleClickOpenDisable}
          >
            Inhabilitar
          </Button>
        )}
      </Box>

      <Divider />

      <h2>Rol: {UsertypeIDToString(usertype_id)}</h2>
      <h2>Nombre de usuario: {username}</h2>
      <h2>Correo electrónico: {mail_address}</h2>
      <ConfirmDialog
        open={openDisable}
        handleClose={handleClose}
        msg={"Se inhabilitara al usuario, impidiendo su acceso al servicio."}
        navigateDir={"/users"}
        onConfirm={handleDisableUser}
      />

      <ConfirmDialog
        open={openEnable}
        handleClose={handleClose}
        msg={"Se habilitara al usuario, devolviendo el acceso al servicio."}
        navigateDir={"/users"}
        onConfirm={handleEnableUser}
      />
    </Fragment>
  );
};

export default UserLoader;
