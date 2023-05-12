import { Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

function TenantsList() {
  const [tenants, setTenants] = useState<any[]>([]);

  const loadTenants = async () => {
    const response = await fetch("http://localhost:4000/tenants");
    const data = await response.json();
    setTenants(data);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const navigate = useNavigate();

  const handleDelete = async (id: any) => {
    /* try {
      await fetch(`http://localhost:4000/tenants/${id}`, {
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
        <h1>Lista de clientes</h1>

        <Button variant="outlined" onClick={() => navigate("/tenants/new")}>
          <AddIcon sx={{ mr: 1 }} />
          Crear nuevo cliente
        </Button>
      </div>

      {tenants
        .filter((tenant) => tenant.id !== 1) // filtra al tenant systadmin
        .map((tenant) => (
          <Card key={tenant.id} style={{ marginBottom: ".7rem" }}>
            <CardContent
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <Typography>{tenant["name"]}</Typography>
              </div>

              <div>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
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
                  onClick={() => handleDelete(tenant.id)}
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

export default TenantsList;
