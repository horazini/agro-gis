import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Add as AddIcon, FormatListBulleted } from "@mui/icons-material";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import { getTenantUsers } from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { DataFetcher, PageTitle } from "../../components/customComponents";
import { UsertypeIDToString } from "../../utils/functions";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
}

const UserListLoad = () => {
  PageTitle("Usuarios");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const usersGetter = async () => {
    const data = await getTenantUsers(Number(tenantId));
    return ["users", data];
  };

  return (
    <DataFetcher getResourceFunctions={[usersGetter]}>
      {(params) => <UserList {...params} />}
    </DataFetcher>
  );
};

const UserList = ({ users }: { users: user[] }) => {
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
        <h1>Usuarios</h1>
        <Button variant="outlined" onClick={() => navigate(`/users/new`)}>
          <AddIcon sx={{ mr: 1 }} />
          Crear nuevo usuario
        </Button>
      </Box>
      {users.length > 0 ? (
        <Fragment>
          {users.map((user) => (
            <UserCard user={user} key={user.id} />
          ))}
        </Fragment>
      ) : (
        <h3> El cliente no registra usuarios. </h3>
      )}
    </Fragment>
  );
};

export const UserCard = ({ user }: any) => {
  const navigate = useNavigate();

  return (
    <Card key={user.id} style={{ marginBottom: ".7rem" }}>
      <CardContent style={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Box fontStyle={{ display: "flex" }}>
            <Typography>
              {user.surname}, {user.names}
            </Typography>
            {user.deleted === true ? (
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
          <Typography>{UsertypeIDToString(user.usertype_id)}</Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/users/${user.id}`)}
            style={{ marginLeft: ".5rem" }}
            startIcon={<FormatListBulleted />}
          >
            Ver detalles
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserListLoad;
