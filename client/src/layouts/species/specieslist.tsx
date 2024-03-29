import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { Add as AddIcon, FormatListBulleted } from "@mui/icons-material";

import { speciesMainData, getTenantSpecies } from "../../utils/services";
import { DataFetcher, PageTitle } from "../../components/customComponents";

const SpeciesListLoader = () => {
  PageTitle("Especies");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const getSpecies = async () => {
    const data = await getTenantSpecies(Number(tenantId));
    return ["species", data];
  };

  return (
    <DataFetcher getResourceFunctions={[getSpecies]}>
      {(params) => <SpeciesList {...params} />}
    </DataFetcher>
  );
};

const SpeciesList = ({ species }: { species: speciesMainData[] }) => {
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
      {species.length > 0 ? (
        <Fragment>
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
      ) : (
        <h3> No hay especies registradas. </h3>
      )}
    </Fragment>
  );
};

export default SpeciesListLoader;
