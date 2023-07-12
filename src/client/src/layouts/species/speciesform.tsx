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
} from "../../services/services";
import { CancelButton, ConfirmButton } from "../../components/confirmform";

const theme = createTheme();

interface ISpecies {
  id: number | null;
  name: string;
  description: string;
  tenant_id: number;
}

interface IStageData {
  id: number | null;
  sequence_number: number;
  name: string;
  description: string;
  estimatedTime: number | string;
  estimatedTimeUnit: string;
}

interface IGrowthEventData {
  id: number | null;
  form_id: number;
  name: string;
  description: string;
  referenceStage: any;
  ETFromStageStart: number | string;
  ETFromStageStartUnit: string;
  timePeriod: number | string | null;
  timePeriodUnit: string;
}

function SpeciesForm(): JSX.Element {
  const params = useParams();

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const timeUnits = [
    { key: "days", label: "Día/s" },
    { key: "weeks", label: "Semana/s" },
    { key: "months", label: "Mes/es" },
    { key: "years", label: "Año/s" },
  ];

  // Datos principales de especie

  const [species, setSpecies] = useState<ISpecies>({
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

  // Etapas

  const [stageData, setStageData] = useState<IStageData>({
    id: null,
    sequence_number: 0,
    name: "",
    description: "",
    estimatedTime: "",
    estimatedTimeUnit: "",
  });

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
    //event.preventDefault();
    if (editingStageRowId !== null) {
      setStagesList((prevRows) =>
        prevRows.map((row) =>
          row.sequence_number === editingStageRowId ? stageData : row
        )
      );
    } else {
      setStagesList((prevRows) => [
        ...prevRows,
        {
          ...stageData,
          sequence_number:
            prevRows.length === 0
              ? 1
              : Math.max(...prevRows.map((row) => row.sequence_number)) + 1,
        },
      ]);
    }
    setStageData({
      id: null,
      sequence_number: 0,
      name: "",
      description: "",
      estimatedTime: "",
      estimatedTimeUnit: "",
    });
    setEditingStageRowId(null);
  };

  const handleEditRow = (row: IStageData) => {
    setStageData(row);
    setEditingStageRowId(row.sequence_number);
  };

  const handleDeleteStage = (sequence_number: number) => {
    setStagesList((prevRows) =>
      prevRows.filter((row) => row.sequence_number !== sequence_number)
    );

    setGrowthEventsList((prevRows) =>
      prevRows.filter((row) => row.referenceStage !== sequence_number)
    );
  };

  // Swap Rows

  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const swapRows = (fromIndex: number, toIndex: number) => {
    const newRows = [...stagesList];
    const temp = newRows[fromIndex];
    newRows[fromIndex] = newRows[toIndex];
    newRows[toIndex] = temp;
    setStagesList(newRows);
  };

  const handleMoveUpClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.sequence_number === selectedRowId
    );
    if (selectedIndex > 0) {
      swapRows(selectedIndex, selectedIndex - 1);
    }
  };

  const handleMoveDownClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.sequence_number === selectedRowId
    );
    if (selectedIndex < stagesList.length - 1) {
      swapRows(selectedIndex, selectedIndex + 1);
    }
  };

  const handleMoveTopClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.sequence_number === selectedRowId
    );
    if (selectedIndex > 0) {
      swapRows(selectedIndex, 0);
    }
  };

  const handleMoveBottomClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.sequence_number === selectedRowId
    );
    const lastIndex = stagesList.length - 1;
    if (selectedIndex < lastIndex) {
      swapRows(selectedIndex, lastIndex);
    }
  };

  // Tareas

  const [growthEventData, setGrowthEventData] = useState<IGrowthEventData>({
    id: null,
    form_id: 0,
    name: "",
    description: "",
    referenceStage: "",
    ETFromStageStart: "",
    ETFromStageStartUnit: "",
    timePeriod: " ",
    timePeriodUnit: "",
  });

  const handleEventChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setGrowthEventData({ ...growthEventData, [name]: value });
  };

  const disableEventSubmit = () => {
    const { name, referenceStage, ETFromStageStart, ETFromStageStartUnit } =
      growthEventData;
    return !(
      name &&
      referenceStage &&
      ETFromStageStart &&
      ETFromStageStartUnit
    );
  };

  const [growthEventsList, setGrowthEventsList] = useState<IGrowthEventData[]>(
    []
  );

  const [timeFromStartError, setTimeFromStartError] = useState(false);

  const handleEventValidation = () => {
    const { ETFromStageStart, ETFromStageStartUnit, referenceStage } =
      growthEventData;

    const ETFromStageStartUnitIndex = timeUnits.findIndex(
      (unit) => unit.key === ETFromStageStartUnit
    );

    const StageET = stagesList.find(
      (stage) => stage.sequence_number === referenceStage
    )?.estimatedTime;

    const StageETUnit = stagesList.find(
      (stage) => stage.sequence_number === referenceStage
    )?.estimatedTimeUnit;
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

  const [editingEventRowId, setEditingEventRowId] = useState<number | null>(
    null
  );

  const handleEventSubmit = () => {
    if (editingEventRowId !== null) {
      setGrowthEventsList((prevRows) =>
        prevRows.map((row) =>
          row.form_id === editingEventRowId ? growthEventData : row
        )
      );
    } else {
      setGrowthEventsList((prevRows) => [
        ...prevRows,
        {
          ...growthEventData,
          form_id:
            prevRows.length === 0
              ? 1
              : Math.max(...prevRows.map((row) => row.form_id)) + 1,
        },
      ]);
    }

    setGrowthEventData({
      id: null,
      form_id: 0,
      name: "",
      description: "",
      referenceStage: "",
      ETFromStageStart: "",
      ETFromStageStartUnit: "",
      timePeriod: "",
      timePeriodUnit: "",
    });
    setEditingEventRowId(null);
  };

  const handleEditEvent = (row: IGrowthEventData) => {
    setGrowthEventData(row);
    setEditingEventRowId(row.form_id);
  };

  const handleDeleteEvent = (form_id: number) => {
    setGrowthEventsList((prevRows) =>
      prevRows.filter((row) => row.form_id !== form_id)
    );
  };

  // Subtim form

  const handleSubmitForm = async () => {
    try {
      const speciesData = {
        species: {
          id: species.id,
          name: species.name,
          description: species.description,
          tenant_id: species.tenant_id,
        },
        stages: stagesList.map((stage: IStageData) => {
          return {
            id: stage.id,
            sequence_number: stage.sequence_number,
            name: stage.name,
            description: stage.description,
            estimatedTime: stage.estimatedTime,
            estimatedTimeUnit: stage.estimatedTimeUnit,
            //estimated_time: stage.estimatedTime + " " + stage.estimatedTimeUnit,
            growthEvents: growthEventsList
              .filter((event) => event.referenceStage == stage.sequence_number)
              .map((event: IGrowthEventData) => {
                let time_period;
                if (
                  (event.timePeriod === "" && event.timePeriodUnit === "") ||
                  (event.timePeriod !== "" && event.timePeriodUnit !== "")
                ) {
                  time_period = event.timePeriod + " " + event.timePeriodUnit;
                }

                return {
                  id: event.id,
                  form_id: event.id,
                  name: event.name,
                  description: event.description,
                  /* et_from_stage_start:
                    event.ETFromStageStart + " " + event.ETFromStageStartUnit,
                  time_period, */
                  ETFromStageStart: event.ETFromStageStart,
                  ETFromStageStartUnit: event.ETFromStageStartUnit,
                  timePeriod: event.timePeriod,
                  timePeriodUnit: event.timePeriodUnit,
                  referenceStage: event.referenceStage,
                };
              }),
          };
        }),
      };

      if (editing) {
        console.log("new speciesData:", speciesData);
        //await putSpeciesData(speciesData, params.id);
      } else {
        //await postSpeciesData(speciesData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Cargar especie existente (caso de edicion)

  const [editing, setEditing] = useState(false);

  const loadSpecies = async (id: string) => {
    try {
      const data = await getSpeciesData(id);
      setSpecies(data.species);
      setStagesList(data.stages);

      const growthEvents: any = [];
      data.stages.forEach((stage: any) => {
        stage.growthEvents.forEach((event: any) => {
          growthEvents.push(event);
        });
      });
      setGrowthEventsList(growthEvents);

      console.log("original speciesData:", data);
      setEditing(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadSpecies(params.id);
    }
  }, [params.id]);

  const handleOutsideClick = () => {
    setSelectedRowId(null);
  };

  const msg: string = editing
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
            {editing ? "Editar especie" : "Agregar nueva especie"}
          </Typography>

          <>
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
          </>

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
                          { icon: <DownIcon />, onClick: handleMoveDownClick },
                          {
                            icon: <DoubleDownIcon />,
                            onClick: handleMoveBottomClick,
                          },
                        ].map((item, index) => {
                          const { icon, onClick } = item;
                          return (
                            <IconButton
                              disabled={!selectedRowId}
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
                    {stagesList.map((row) => (
                      <TableRow
                        key={row.sequence_number}
                        selected={row.sequence_number === selectedRowId}
                        onClick={() => setSelectedRowId(row.sequence_number)}
                      >
                        <TableCell>{stagesList.indexOf(row) + 1}</TableCell>
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
                          <Button onClick={() => handleEditRow(row)}>
                            <EditIcon sx={{ mr: 1 }} />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteStage(row.sequence_number)
                            }
                          >
                            <DeleteIcon sx={{ mr: 1 }} />
                          </Button>
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
                    {growthEventsList
                      .sort((a, b) => {
                        const stageA = stagesList.findIndex(
                          (stage) => stage.sequence_number === a.referenceStage
                        );
                        const stageB = stagesList.findIndex(
                          (stage) => stage.sequence_number === b.referenceStage
                        );
                        if (stageA !== stageB) {
                          return stageA - stageB;
                        } else {
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
                        }
                      })
                      .map((row) => (
                        <TableRow key={row.form_id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            {
                              stagesList.find(
                                (stage) =>
                                  stage.sequence_number === row.referenceStage
                              )?.name
                            }
                          </TableCell>
                          <TableCell>
                            {row.ETFromStageStart}{" "}
                            {
                              timeUnits.find(
                                (unit) => unit.key === row.ETFromStageStartUnit
                              )?.label
                            }
                          </TableCell>
                          <TableCell>
                            {(row.timePeriod === "" &&
                              row.timePeriodUnit === "") ||
                            (row.timePeriod !== "" &&
                              row.timePeriodUnit !== "") ? (
                              <>
                                {row.timePeriod}{" "}
                                {
                                  timeUnits.find(
                                    (unit) => unit.key === row.timePeriodUnit
                                  )?.label
                                }
                              </>
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <Button onClick={() => handleEditEvent(row)}>
                              <EditIcon sx={{ mr: 1 }} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteEvent(row.form_id)}
                            >
                              <DeleteIcon sx={{ mr: 1 }} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
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
                    value={growthEventData.referenceStage || ""}
                    onChange={handleEventChange}
                    displayEmpty
                    variant="standard"
                  >
                    {stagesList.length > 0 ? (
                      stagesList.map((stage) => (
                        <MenuItem
                          key={stage.sequence_number}
                          value={stage.sequence_number}
                        >
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
                    inputProps: { min: 0 },
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
