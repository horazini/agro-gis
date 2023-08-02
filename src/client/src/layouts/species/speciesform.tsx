import { useEffect, useState } from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

import {
  KeyboardDoubleArrowUp as DoubleUpIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  KeyboardDoubleArrowDown as DoubleDownIcon,
} from "@mui/icons-material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  getSpeciesData,
  postSpeciesData,
  putSpeciesData,
  speciesDataType,
} from "../../services/services";
import {
  CancelButton,
  ConfirmButton,
  DialogButton,
} from "../../components/customComponents";

const theme = createTheme();

interface ISpeciesData {
  id: number | null;
  name: string;
  description: string;
  tenant_id: number;
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

const nullStageData = {
  id: null,
  name: "",
  description: "",
  estimatedTime: "",
  estimatedTimeUnit: "",
  growthEvents: [],
};

const nullGrowthEventData = {
  id: null,
  name: "",
  description: "",
  ETFromStageStart: "",
  ETFromStageStartUnit: "",
  timePeriod: " ",
  timePeriodUnit: "",
};

function SpeciesForm(): JSX.Element {
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const timeUnits = [
    { key: "days", label: "Día/s" },
    { key: "weeks", label: "Semana/s" },
    { key: "months", label: "Mes/es" },
    { key: "years", label: "Año/s" },
  ];

  // Datos principales de especie

  const [species, setSpecies] = useState<ISpeciesData>({
    id: null,
    name: "",
    description: "",
    tenant_id: tenantId || 1,
  });

  const handleSpeciesChange = (e: {
    target: { name: string; value: string };
  }) => {
    setSpecies({ ...species, [e.target.name]: e.target.value });
  };

  // Stages and events data

  const clearAllFields = () => {
    setStageData(nullStageData);
    setEditingStageRowId(null);
    setGrowthEventData(nullGrowthEventData);
    setEditingEventRowId(null);
    setReferenceStage("");
  };

  // Etapas

  const [stageData, setStageData] = useState<IStageData>(nullStageData);

  const handleStageChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setStageData({ ...stageData, [name]: value });
  };

  const disableStageSubmit = () => {
    const { name, estimatedTime, estimatedTimeUnit } = stageData;
    return !(name && estimatedTime && estimatedTimeUnit);
  };

  const [stagesList, setStagesList] = useState<IStageData[]>([]);

  const [editingStageRowId, setEditingStageRowId] = useState<number | null>(
    null
  );

  const handleStageSubmit = () => {
    if (editingStageRowId !== null) {
      const modifiedStage = stageData;
      setStagesList(
        stagesList.map((stage, index) =>
          index === editingStageRowId ? modifiedStage : stage
        )
      );
    } else {
      setStagesList((prevRows) => [...prevRows, stageData]);
    }

    clearAllFields();
  };

  const handleEditStage = (row: IStageData, index: number) => {
    setStageData(row);
    setEditingStageRowId(index);
  };

  const handleDeleteStage = (index: number) => {
    setSelectedStageIndex(null);
    if (isEditingForm) {
      const found = stagesList[index];
      if (found?.id) {
        const deletedId = found.id;
        setDeletedStages((prev) => [...prev, deletedId]);
      }
    }

    setStagesList((prevRows) =>
      prevRows.filter((row) => prevRows.indexOf(row) !== index)
    );

    clearAllFields();
  };

  // Swap Rows

  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(
    null
  );

  const swapRows = (fromIndex: number, toIndex: number) => {
    setStagesList(
      stagesList.map((stage, index) =>
        index === fromIndex
          ? stagesList[toIndex]
          : index === toIndex
          ? stagesList[fromIndex]
          : stage
      )
    );
  };

  const handleMoveUpClick = () => {
    if (selectedStageIndex && selectedStageIndex > 0) {
      swapRows(selectedStageIndex, selectedStageIndex - 1);
      setSelectedStageIndex(selectedStageIndex - 1);
    }
  };

  const handleMoveDownClick = () => {
    if (
      selectedStageIndex !== null &&
      selectedStageIndex < stagesList.length - 1
    ) {
      swapRows(selectedStageIndex, selectedStageIndex + 1);
      setSelectedStageIndex(selectedStageIndex + 1);
    }
  };

  const handleMoveTopClick = () => {
    if (selectedStageIndex !== null && selectedStageIndex >= 0) {
      const newStageslist = stagesList;
      const element = newStageslist.splice(selectedStageIndex, 1)[0]; // Remove the element from the original position
      newStageslist.unshift(element); // Add the element at the beginning
      setStagesList(newStageslist);
      setSelectedStageIndex(0);
    }
  };

  const handleMoveBottomClick = () => {
    if (selectedStageIndex !== null && selectedStageIndex < stagesList.length) {
      const newStageslist = stagesList;
      const element = newStageslist.splice(selectedStageIndex, 1)[0]; // Remove the element from the original position
      newStageslist.push(element); // Add the element at the end
      setStagesList(newStageslist);
      setSelectedStageIndex(stagesList.length - 1);
    }
  };

  // Tareas

  const [editingEventRowId, setEditingEventRowId] = useState<number[] | null>(
    null
  );
  const [referenceStage, setReferenceStage] = useState<number | string>("");
  const [timeFromStartError, setTimeFromStartError] = useState(false);

  const [growthEventData, setGrowthEventData] =
    useState<IGrowthEventData>(nullGrowthEventData);

  const handleEventChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setGrowthEventData({ ...growthEventData, [name]: value });
  };

  const handleEditEvent = (row: IGrowthEventData, rowIndex: number[]) => {
    setGrowthEventData(row);
    setReferenceStage(rowIndex[0]);
    setEditingEventRowId(rowIndex);
  };

  const disableEventSubmit = () => {
    const { name, ETFromStageStart, ETFromStageStartUnit } = growthEventData;
    return !(
      name &&
      referenceStage !== "" &&
      ETFromStageStart &&
      ETFromStageStartUnit
    );
  };

  const handleEventValidation = () => {
    const { ETFromStageStart, ETFromStageStartUnit } = growthEventData;

    const ETFromStageStartUnitIndex = timeUnits.findIndex(
      (unit) => unit.key === ETFromStageStartUnit
    );

    if (typeof referenceStage === "string") return;

    const StageET = stagesList[referenceStage].estimatedTime;

    const StageETUnit = stagesList[referenceStage].estimatedTimeUnit;
    const estimatedTimeUnitIndex = timeUnits.findIndex(
      (unit) => unit.key === StageETUnit
    );

    const isValidTime =
      ETFromStageStartUnitIndex < estimatedTimeUnitIndex ||
      (ETFromStageStartUnitIndex <= estimatedTimeUnitIndex &&
        Number(ETFromStageStart) <= Number(StageET));

    setTimeFromStartError(!isValidTime);

    if (isValidTime) {
      handleEventSubmit();
    }
  };

  const handleEventSubmit = () => {
    if (typeof referenceStage === "string") return;

    if (editingEventRowId !== null) {
      const newStageList = stagesList;
      newStageList[editingEventRowId[0]].growthEvents.splice(
        editingEventRowId[1],
        1
      );
      newStageList[referenceStage].growthEvents.push(growthEventData);
      setStagesList(newStageList);
    } else {
      setStagesList((prevStagesList) => {
        return prevStagesList.map((stage, index) => {
          if (index === referenceStage) {
            return {
              ...stage,
              growthEvents: [...stage.growthEvents, growthEventData],
            };
          }
          return stage;
        });
      });
    }

    clearAllFields();
  };

  const handleDeleteEvent = (stageIndex: number, eventIndex: number) => {
    if (isEditingForm) {
      const found = stagesList[stageIndex].growthEvents[eventIndex];
      if (found?.id) {
        const deletedId = found.id;
        setDeletedEvents((prev) => [...prev, deletedId]);
      }
    }

    setStagesList((prev) => {
      return prev.map((stage, index) => {
        if (index === stageIndex) {
          const newGrowthEvents = [...stage.growthEvents];
          newGrowthEvents.splice(eventIndex, 1);
          return {
            ...stage,
            growthEvents: newGrowthEvents,
          };
        }
        return stage;
      });
    });

    clearAllFields();
  };

  // Subtim form

  const handleSubmitForm = async () => {
    try {
      const speciesData: speciesDataType = {
        species,
        stages: stagesList.map((stage: IStageData) => {
          return {
            ...stage,
            estimated_time: stage.estimatedTime + " " + stage.estimatedTimeUnit,
            growthEvents: stage.growthEvents.map((event: IGrowthEventData) => {
              let time_period;
              if (event.timePeriod !== "" && event.timePeriodUnit !== "") {
                time_period = event.timePeriod + " " + event.timePeriodUnit;
              }

              return {
                ...event,
                et_from_stage_start:
                  event.ETFromStageStart + " " + event.ETFromStageStartUnit,
                time_period,
              };
            }),
          };
        }),
      };

      if (isEditingForm) {
        const updateData = {
          deletedEvents,
          deletedStages,
          speciesData,
        };
        await putSpeciesData(updateData, params.id);
      } else {
        await postSpeciesData(speciesData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Cargar especie existente (caso de edicion)

  const params = useParams();

  const [isEditingForm, setIsEditingForm] = useState(false);

  const [deletedStages, setDeletedStages] = useState<number[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<number[]>([]);

  const loadSpecies = async (id: string) => {
    try {
      const data = await getSpeciesData(id);
      setSpecies(data.species);
      setStagesList(data.stages);
      setIsEditingForm(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadSpecies(params.id);
    }
  }, [params.id]);

  // ---

  const handleOutsideClick = () => {
    setSelectedStageIndex(null);
  };

  const msg: string = isEditingForm
    ? "Se actualizará a la especie con todas sus fases y tareas."
    : "Se dará de alta a la especie con todas sus fases y tareas.";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            {isEditingForm ? "Editar especie" : "Agregar nueva especie"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                inputProps={{ maxLength: 100 }}
                id="name"
                name="name"
                label="Nombre de la especie"
                fullWidth
                variant="standard"
                value={species.name || ""}
                onChange={handleSpeciesChange}
              />
            </Grid>
          </Grid>
          <br />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                inputProps={{ maxLength: 50 }}
                id="description"
                name="description"
                label="Descripción"
                fullWidth
                variant="standard"
                value={species.description || ""}
                onChange={handleSpeciesChange}
              />
            </Grid>
          </Grid>
          <br />

          <Typography variant="h6" gutterBottom>
            Etapas de crecimiento
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell> </TableCell>
                      <TableCell>Etapa</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Tiempo estimado</TableCell>
                      <TableCell>Opciones</TableCell>
                      <TableCell align="center">
                        Mover fila seleccionada:
                        <br />
                        {[
                          {
                            icon: <DoubleUpIcon />,
                            onClick: handleMoveTopClick,
                          },

                          { icon: <UpIcon />, onClick: handleMoveUpClick },
                          {
                            icon: <DownIcon />,
                            onClick: handleMoveDownClick,
                          },
                          {
                            icon: <DoubleDownIcon />,
                            onClick: handleMoveBottomClick,
                          },
                        ].map((item, index) => {
                          const { icon, onClick } = item;
                          return (
                            <IconButton
                              disabled={selectedStageIndex === null}
                              onClick={onClick}
                              key={index}
                            >
                              {icon}
                            </IconButton>
                          );
                        })}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stagesList.map((row, index) => (
                      <TableRow
                        key={index}
                        selected={index === selectedStageIndex}
                        onClick={() => setSelectedStageIndex(index)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>
                          {row.estimatedTime}{" "}
                          {
                            timeUnits.find(
                              (unit) => unit.key === row.estimatedTimeUnit
                            )?.label
                          }
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleEditStage(row, index)}>
                            <EditIcon sx={{ mr: 1 }} />
                          </Button>
                          <DialogButton
                            icon={<DeleteIcon sx={{ mr: 1 }} />}
                            dialogTitle={"¿Desea eliminar este elemento?"}
                            dialogSubtitle={
                              "Se eliminarán tambien sus tareas asignadas."
                            }
                            onConfirm={() => handleDeleteStage(index)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TextField
                  required
                  label="Nombre"
                  name="name"
                  value={stageData.name}
                  onChange={handleStageChange}
                />
                <TextField
                  label="Descripción"
                  name="description"
                  value={stageData.description}
                  onChange={handleStageChange}
                />
                <TextField
                  required
                  label="Tiempo estimado"
                  name="estimatedTime"
                  value={stageData.estimatedTime}
                  onChange={handleStageChange}
                  type="number"
                  fullWidth
                  onKeyPress={(event) => {
                    if (
                      event?.key === "-" ||
                      event?.key === "+" ||
                      event?.key === "." ||
                      event?.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  InputProps={{
                    inputProps: { min: 0 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Select
                          value={stageData.estimatedTimeUnit}
                          onChange={handleStageChange}
                          name="estimatedTimeUnit"
                          displayEmpty
                          variant="standard"
                        >
                          <MenuItem value="" disabled>
                            Seleccione una unidad
                          </MenuItem>
                          {timeUnits.map((unit) => (
                            <MenuItem key={unit.key} value={unit.key}>
                              {unit.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  onClick={handleStageSubmit}
                  disabled={disableStageSubmit()}
                >
                  {editingStageRowId !== null ? "Actualizar" : "Agregar"}
                </Button>
              </TableContainer>
            </Grid>
          </Grid>
          <br />

          <Typography variant="h6" gutterBottom>
            Tareas agrícolas
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarea</TableCell>
                      <TableCell>Etapa</TableCell>
                      <TableCell>Tiempo desde inicio de etapa</TableCell>
                      <TableCell>Periodo de repetición</TableCell>
                      <TableCell>Opciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stagesList.length > 0 ? (
                      stagesList.map((stage, stageIndex) =>
                        stage.growthEvents
                          .sort((a, b) => {
                            const unitA = timeUnits.findIndex(
                              (unit) => unit.key === a.ETFromStageStartUnit
                            );
                            const unitB = timeUnits.findIndex(
                              (unit) => unit.key === b.ETFromStageStartUnit
                            );

                            if (unitA !== unitB) {
                              return unitA - unitB;
                            } else {
                              return (
                                Number(a.ETFromStageStart) -
                                Number(b.ETFromStageStart)
                              );
                            }
                          })
                          .map((event, eventIndex) => (
                            <TableRow key={eventIndex}>
                              <TableCell>{event.name}</TableCell>
                              <TableCell>{stage.name}</TableCell>
                              <TableCell>
                                {event.ETFromStageStart}{" "}
                                {
                                  timeUnits.find(
                                    (unit) =>
                                      unit.key === event.ETFromStageStartUnit
                                  )?.label
                                }
                              </TableCell>
                              <TableCell>
                                {(event.timePeriod === "" &&
                                  event.timePeriodUnit === "") ||
                                (event.timePeriod !== "" &&
                                  event.timePeriodUnit !== "") ? (
                                  <>
                                    {event.timePeriod}{" "}
                                    {
                                      timeUnits.find(
                                        (unit) =>
                                          unit.key === event.timePeriodUnit
                                      )?.label
                                    }
                                  </>
                                ) : null}
                              </TableCell>

                              <TableCell>
                                <Button
                                  onClick={() =>
                                    handleEditEvent(event, [
                                      stageIndex,
                                      eventIndex,
                                    ])
                                  }
                                >
                                  <EditIcon sx={{ mr: 1 }} />
                                </Button>
                                <DialogButton
                                  icon={<DeleteIcon sx={{ mr: 1 }} />}
                                  dialogTitle={"¿Desea eliminar este elemento?"}
                                  dialogSubtitle={
                                    "Se eliminará de la lista de tareas."
                                  }
                                  onConfirm={() =>
                                    handleDeleteEvent(stageIndex, eventIndex)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))
                      )
                    ) : (
                      <TableRow>
                        <TableCell>{"Ingrese etapas"}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Box>
                  <TextField
                    required
                    label="Nombre"
                    name="name"
                    value={growthEventData.name}
                    onChange={handleEventChange}
                  />
                  <TextField
                    label="Descripción"
                    name="description"
                    value={growthEventData.description}
                    onChange={handleEventChange}
                  />

                  <FormControl
                    required
                    variant="filled"
                    sx={{ m: 1, minWidth: 220 }}
                  >
                    <InputLabel>Etapa</InputLabel>

                    <Select
                      name="referenceStage"
                      value={referenceStage}
                      onChange={(event) =>
                        setReferenceStage(event.target.value)
                      }
                      displayEmpty
                      variant="standard"
                    >
                      {stagesList.length > 0 ? (
                        stagesList.map((stage, index) => (
                          <MenuItem key={index} value={index}>
                            {stage.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>{"Ingrese etapas"}</MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <TextField
                    required
                    label="Tiempo desde el inicio de la etapa"
                    name="ETFromStageStart"
                    value={growthEventData.ETFromStageStart}
                    onChange={handleEventChange}
                    type="number"
                    fullWidth
                    error={timeFromStartError}
                    helperText={
                      timeFromStartError
                        ? "El tiempo desde inicio de etapa debe ser menor a la duración de la misma"
                        : ""
                    }
                    onKeyPress={(event) => {
                      if (
                        event?.key === "-" ||
                        event?.key === "+" ||
                        event?.key === "." ||
                        event?.key === "e"
                      ) {
                        event.preventDefault();
                      }
                    }}
                    InputProps={{
                      inputProps: { min: 0 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Select
                            name="ETFromStageStartUnit"
                            value={growthEventData.ETFromStageStartUnit}
                            onChange={handleEventChange}
                            displayEmpty
                            variant="standard"
                          >
                            <MenuItem value="" disabled>
                              Seleccione una unidad
                            </MenuItem>
                            {timeUnits.map((unit) => (
                              <MenuItem key={unit.key} value={unit.key}>
                                {unit.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Periodo de repetición"
                    name="timePeriod"
                    value={growthEventData.timePeriod}
                    onChange={handleEventChange}
                    type="number"
                    fullWidth
                    onKeyPress={(event) => {
                      if (
                        event?.key === "-" ||
                        event?.key === "+" ||
                        event?.key === "." ||
                        event?.key === "e"
                      ) {
                        event.preventDefault();
                      }
                    }}
                    InputProps={{
                      inputProps: { min: 1 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Select
                            name="timePeriodUnit"
                            value={growthEventData.timePeriodUnit}
                            onChange={handleEventChange}
                            displayEmpty
                            variant="standard"
                          >
                            <MenuItem value="" disabled>
                              Seleccione una unidad
                            </MenuItem>
                            <MenuItem value="">
                              No es una tarea periódica
                            </MenuItem>
                            {timeUnits.map((unit) => (
                              <MenuItem key={unit.key} value={unit.key}>
                                {unit.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Button
                  type="submit"
                  onClick={handleEventValidation}
                  disabled={disableEventSubmit()}
                >
                  {editingEventRowId !== null ? "Actualizar" : "Agregar"}
                </Button>
              </TableContainer>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CancelButton navigateDir={"/species/list"} />
            <ConfirmButton
              msg={msg}
              onConfirm={handleSubmitForm}
              navigateDir={"/species/list"}
              disabled={!species.name}
            />
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default SpeciesForm;
