import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { Add as AddIcon, FormatListBulleted } from "@mui/icons-material";

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
                onClick={() => navigate(`/species/${specie.id}`)}
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
  );
}

export default SpeciesList;
