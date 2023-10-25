import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Add as AddIcon, FormatListBulleted } from "@mui/icons-material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTenantUsers } from "../../services/services";
import { UsertypeIDToString } from "../../components/customComponents";
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

const UserListLoad = () => {
  PageTitle("Usuarios");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [tenantData, setTenantData] = useState<{
    tenantName: string;
    users: never[];
  }>({
    tenantName: "",
    users: [],
  });

  const loadTenant = async (id: number) => {
    try {
      const data = await getTenantUsers(id);
      setTenantData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId]);

  return <Fragment>{UserList(tenantData.users)}</Fragment>;
};

const UserList = (users: user[]) => {
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
            <Card key={user.id} style={{ marginBottom: ".7rem" }}>
              <CardContent
                style={{ display: "flex", justifyContent: "space-between" }}
              >
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
                  <Typography>
                    {UsertypeIDToString(user.usertype_id)}
                  </Typography>
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => navigate(`/users/${user.id}`)}
                    style={{ marginLeft: ".5rem" }}
                    startIcon={<FormatListBulleted />}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Fragment>
      ) : (
        <h3> El cliente no registra usuarios. </h3>
      )}
    </Fragment>
  );
};

export default UserListLoad;
