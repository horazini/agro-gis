import { Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { API } from "../../config";

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
      const res = await fetch(`${API}/tenantdata/${id}`);
      const data = await res.json();
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

  //

  const handleDelete = async (id: any) => {
    /* try {
      await fetch(`${API}/tenants/${id}`, {
        method: "DELETE",
      });
      setTenants(tenants.filter((tenant) => tenant.id !== id));
    } catch (error) {
      console.log(error);
    } */
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>{tenantData.tenant.name}</h1>

        {/* <Button variant="outlined" onClick={() => navigate("/tenants/new")}>
          <AddIcon sx={{ mr: 1 }} />
          Crear nuevo cliente
        </Button> */}
      </div>

      {tenantData.users.map((user) => (
        <Card key={user.id} style={{ marginBottom: ".7rem" }}>
          <CardContent
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <Typography>
                {user.surname}, {user.names}
              </Typography>
            </div>

            <div>
              <Button
                variant="contained"
                color="inherit"
                /* onClick={() => navigate(`/tenants/${tenant.id}`)} */
                endIcon={<EditIcon />}
              >
                Ver
              </Button>
              <Button
                variant="contained"
                color="inherit"
                style={{ marginLeft: ".5rem" }}
                //onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
                endIcon={<EditIcon />}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="warning"
                style={{ marginLeft: ".5rem" }}
                /* onClick={() => handleDelete(tenant.id)} */
                endIcon={<DeleteIcon />}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default TenantDetails;
