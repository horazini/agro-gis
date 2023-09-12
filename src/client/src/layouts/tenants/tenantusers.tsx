import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

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

const UserList = (users: user[]) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(-1);

  return (
    <Fragment>
      <h1>Usuarios</h1>
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

const TenantDetails = () => {
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

export default TenantDetails;
