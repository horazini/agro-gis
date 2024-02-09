import { Fragment, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Edit as EditIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
} from "@mui/icons-material";
import {
  disableSpecies,
  enableSpecies,
  getDetailedSpeciesData,
} from "../../utils/services";
import {
  ConfirmFetchAndRedirect,
  DataFetcher,
  PageTitle,
} from "../../components/customComponents";

import { FormattedArea } from "../../components/mapcomponents";

interface ISpeciesData {
  id: number;
  name: string;
  description: string;
  tenant_id: number;
  deleted?: boolean;
}

interface IStageData {
  id: number | null;
  name: string;
  description: string;
  estimatedTime: number | string;
  estimatedTimeUnit: string;
  growthEvents: IGrowthEventData[];
}

interface IGrowthEventData {
  id: number | null;
  name: string;
  description: string;
  ETFromStageStart: number | string;
  ETFromStageStartUnit: string;
  timePeriod: number | string | null;
  timePeriodUnit: string;
}

const SpeciesDetailsLoader = () => {
  PageTitle("Especie");
  const params = useParams();

  const speciesDataGetter = async () => {
    const data = await getDetailedSpeciesData(Number(params.id));
    return ["detailedSpeciesData", data];
  };

  return (
    <DataFetcher getResourceFunctions={[speciesDataGetter]}>
      {(params) => <SpeciesDetails {...params} />}
    </DataFetcher>
  );
};

const SpeciesDetails = ({
  detailedSpeciesData,
}: {
  detailedSpeciesData: {
    species: ISpeciesData;
    stages: IStageData[];
    speciesDetails: any;
  };
}): JSX.Element => {
  const { species, stages, speciesDetails } = detailedSpeciesData;

  const timeUnits = [
    { key: "days", label: "Día/s" },
    { key: "weeks", label: "Semana/s" },
    { key: "months", label: "Mes/es" },
    { key: "years", label: "Año/s" },
  ];

  // Enable/disable functions

  const handleDisableSpecies: () => Promise<number> = async () => {
    try {
      return disableSpecies(id);
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const handleEnableSpecies: () => Promise<number> = async () => {
    try {
      return enableSpecies(id);
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  // Etapas

  const { id, name, description, deleted } = species;

  const {
    ongoingCropsNumber,
    finishedCropsNumber,
    finishedCropsAreaSum,
    finishedCropsWeightSum,
  } = speciesDetails;

  const formattedArea = FormattedArea(finishedCropsAreaSum);

  const [open, setOpen] = useState(-1);

  const navigate = useNavigate();
  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Fragment>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>{name}</h1>

          <Box>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              sx={{ mr: 2 }}
              onClick={() => navigate(`/species/${id}/edit`)}
            >
              Editar
            </Button>
            <ConfirmFetchAndRedirect
              component={
                <Button
                  startIcon={
                    deleted ? <RestoreFromTrashIcon /> : <DeleteIcon />
                  }
                  variant="contained"
                  color={deleted ? "success" : "error"}
                  sx={{ mr: 2 }}
                >
                  {deleted ? "Habilitar" : "Eliminar"}
                </Button>
              }
              msg={
                deleted
                  ? "Se habilitará a la especie, devolviendo al cliente su acceso a la misma."
                  : "Se eliminará la especie, impidiendo la creación de nuevos cultivos de la misma."
              }
              navigateDir={"/species"}
              onConfirm={deleted ? handleEnableSpecies : handleDisableSpecies}
            />
          </Box>
        </Box>

        <Divider />

        <h2>Descripción: {description}</h2>

        <h3>
          Actualmente hay {ongoingCropsNumber} cultivos en curso de esta
          especie.
        </h3>

        {finishedCropsNumber > 0 ? (
          <h3>
            Se han relizado {finishedCropsNumber} cosechas de esta especie,
            sumando {finishedCropsWeightSum} toneladas cosechadas en{" "}
            {formattedArea} de tierra.
          </h3>
        ) : (
          <h3> No se registran cosechas de esta especie. </h3>
        )}
      </Fragment>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography variant="h6" gutterBottom>
          Etapas de crecimiento
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TableContainer component={Paper} style={{ padding: 10 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Etapa</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Tiempo estimado</TableCell>
                    <TableCell> </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stages.map((stage: any, index: number) => {
                    const {
                      id,
                      name,
                      description,
                      estimatedTime,
                      estimatedTimeUnit,
                    } = stage;
                    return (
                      <Fragment key={id}>
                        <TableRow key={index} sx={{ "& td": { border: 0 } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{name}</TableCell>
                          <TableCell>{description}</TableCell>
                          <TableCell>
                            {estimatedTime}{" "}
                            {
                              timeUnits.find(
                                (unit) => unit.key === estimatedTimeUnit
                              )?.label
                            }
                          </TableCell>

                          <TableCell align="right">
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => setOpen(open === id ? -1 : id)}
                              style={{ marginLeft: ".5rem" }}
                            >
                              {open === id ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={6}
                          >
                            <Collapse
                              in={open === id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Typography variant="h6" gutterBottom>
                                Tareas agrícolas
                              </Typography>
                              {stage.growthEvents.length > 0 ? (
                                <Grid container spacing={3}>
                                  <Grid item xs={12}>
                                    <TableContainer
                                      component={Paper}
                                      style={{ padding: 10 }}
                                    >
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Tarea</TableCell>
                                            <TableCell>
                                              Tiempo desde inicio de etapa
                                            </TableCell>
                                            <TableCell>
                                              Periodo de repetición
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {stage.growthEvents.map(
                                            (
                                              event: any,
                                              eventIndex: number
                                            ) => (
                                              <TableRow key={eventIndex}>
                                                <TableCell>
                                                  {event.name}
                                                </TableCell>
                                                <TableCell>
                                                  {event.ETFromStageStart}{" "}
                                                  {
                                                    timeUnits.find(
                                                      (unit) =>
                                                        unit.key ===
                                                        event.ETFromStageStartUnit
                                                    )?.label
                                                  }
                                                </TableCell>
                                                <TableCell>
                                                  {(event.timePeriod === "" &&
                                                    event.timePeriodUnit ===
                                                      "") ||
                                                  (event.timePeriod !== "" &&
                                                    event.timePeriodUnit !==
                                                      "") ? (
                                                    <>
                                                      {event.timePeriod}{" "}
                                                      {
                                                        timeUnits.find(
                                                          (unit) =>
                                                            unit.key ===
                                                            event.timePeriodUnit
                                                        )?.label
                                                      }
                                                    </>
                                                  ) : null}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Grid>
                                </Grid>
                              ) : (
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  align="center"
                                  mb={3}
                                >
                                  La etapa no registra tareas.
                                </Typography>
                              )}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SpeciesDetailsLoader;
