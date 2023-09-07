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
} from "@mui/icons-material";

import { disableUser, enableUser, getUserData } from "../../services/services";
import {
  ConfirmDialog,
  UsertypeIDToString,
} from "../../components/customComponents";
import PageTitle from "../../components/title";

interface user {
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
}

const TenantDetails = () => {
  PageTitle("Cliente");

  const params = useParams();

  const [userData, setUserData] = useState<user>({
    usertype_id: 0,
    mail_address: "",
    username: "",
    names: "",
    surname: "",
    deleted: false,
  });

  const { usertype_id, mail_address, username, names, surname, deleted } =
    userData;

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
      return disableUser(Number(params.id));
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const handleEnableUser: () => Promise<number> = async () => {
    try {
      return enableUser(Number(params.id));
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

export default TenantDetails;
