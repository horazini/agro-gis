import { Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

function SpeciesList() {
  const [species, setSpecies] = useState<any[]>([]);

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const loadSpecies = async () => {
    const response = await fetch(
      `http://localhost:4000/tenantspecies/${tenantId}`
    );
    const data = await response.json();
    setSpecies(data);
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const navigate = useNavigate();

  const handleDelete = async (id: any) => {
    try {
      await fetch(`http://localhost:4000/species/${id}`, {
        method: "DELETE",
      });
      setSpecies(species.filter((specie) => specie.id !== id));
    } catch (error) {
      console.log(error);
    }
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
        <h1>Lista de especies</h1>
        <Button variant="outlined" onClick={() => navigate(`/species/new`)}>
          <AddIcon sx={{ mr: 1 }} />
          Agregar nueva especie
        </Button>
      </div>
      {species.map((specie) => (
        <Card key={specie.id} style={{ marginBottom: ".7rem" }}>
          <CardContent
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <Typography>{specie["name"]}</Typography>
              <Typography>{specie["description"]}</Typography>
            </div>

            <div>
              <Button
                variant="contained"
                color="inherit"
                onClick={() => navigate(`/species/${specie.id}/edit`)}
                endIcon={<EditIcon />}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="warning"
                style={{ marginLeft: ".5rem" }}
                onClick={() => handleDelete(specie.id)}
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

export default SpeciesList;
