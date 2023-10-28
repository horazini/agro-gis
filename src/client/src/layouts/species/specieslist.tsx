import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { speciesMainData, getTenantSpecies } from "../../utils/services";
import { PageTitle } from "../../components/customComponents";

function SpeciesList() {
  PageTitle("Especies");

  const [species, setSpecies] = useState<speciesMainData[]>([]);

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const loadSpecies = async () => {
    if (tenantId) {
      const data = await getTenantSpecies(tenantId);
      setSpecies(data);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const navigate = useNavigate();

  const handleDelete = async (id: any) => {
    try {
    } catch (error) {
      console.log(error);
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
        <h1>Especies</h1>
        <Button variant="outlined" onClick={() => navigate(`/species/new`)}>
          <AddIcon sx={{ mr: 1 }} />
          Agregar nueva especie
        </Button>
      </Box>
      {species.map((specie) => (
        <Card key={specie.id} style={{ marginBottom: ".7rem" }}>
          <CardContent
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box>
              <Typography>{specie["name"]}</Typography>
              <Typography>{specie["description"]}</Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                color="primary"
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
            </Box>
          </CardContent>
        </Card>
      ))}
    </Fragment>
  );
}

export default SpeciesList;
