import {
  Fragment,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { API } from "../../config";

import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Step,
  StepLabel,
  Stepper,
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

const theme = createTheme();

interface ISpecies {
  name: string;
  description: string;
  tenant_id: number;
}

interface IStageData {
  id: number;
  name: string;
  description: string;
  estimatedTime: number | string;
  estimatedTimeUnit: string;
  db_id: number | null;
}

interface IGrowthEventData {
  id: number;
  name: string;
  description: string;
  referenceStage: any;
  ETFromStageStart: number | string;
  ETFromStageStartUnit: string;
  timePeriod: number | string | null;
  timePeriodUnit: string;
}

function SpeciesForm(): JSX.Element {
  type FormElement = React.FormEvent<HTMLFormElement>;
  const navigate = useNavigate();
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
    id: 0,
    name: "",
    description: "",
    estimatedTime: "",
    estimatedTimeUnit: "",
    db_id: null,
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

  const handleStageSubmit = () => {
    //event.preventDefault();
    if (editingRowId !== null) {
      setStagesList((prevRows) =>
        prevRows.map((row) => (row.id === editingRowId ? stageData : row))
      );
    } else {
      setStagesList((prevRows) => [
        ...prevRows,
        {
          ...stageData,
          id:
            prevRows.length === 0
              ? 1
              : Math.max(...prevRows.map((row) => row.id)) + 1,
        },
      ]);
    }
    setStageData({
      id: 0,
      name: "",
      description: "",
      estimatedTime: "",
      estimatedTimeUnit: "",
      db_id: null,
    });
    setEditingRowId(null);
  };

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const handleEditRow = (row: IStageData) => {
    setStageData(row);
    setEditingRowId(row.id);
  };

  const handleDeleteStage = (id: number) => {
    setStagesList((prevRows) => prevRows.filter((row) => row.id !== id));

    setGrowthEventsList((prevRows) =>
      prevRows.filter((row) => row.referenceStage !== id)
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
      (row) => row.id === selectedRowId
    );
    if (selectedIndex > 0) {
      swapRows(selectedIndex, selectedIndex - 1);
    }
  };

  const handleMoveDownClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.id === selectedRowId
    );
    if (selectedIndex < stagesList.length - 1) {
      swapRows(selectedIndex, selectedIndex + 1);
    }
  };

  const handleMoveTopClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.id === selectedRowId
    );
    if (selectedIndex > 0) {
      swapRows(selectedIndex, 0);
    }
  };

  const handleMoveBottomClick = () => {
    const selectedIndex = stagesList.findIndex(
      (row) => row.id === selectedRowId
    );
    const lastIndex = stagesList.length - 1;
    if (selectedIndex < lastIndex) {
      swapRows(selectedIndex, lastIndex);
    }
  };

  // Tareas

  const [growthEventData, setGrowthEventData] = useState<IGrowthEventData>({
    id: 0,
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
    const {
      name,
      referenceStage,
      ETFromStageStart,
      ETFromStageStartUnit,
      timePeriod,
      timePeriodUnit,
    } = growthEventData;
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
      (stage) => stage.id === referenceStage
    )?.estimatedTime;

    const StageETUnit = stagesList.find(
      (stage) => stage.id === referenceStage
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

  const handleEventSubmit = () => {
    if (editingRowId !== null) {
      setGrowthEventsList((prevRows) =>
        prevRows.map((row) => (row.id === editingRowId ? growthEventData : row))
      );
    } else {
      setGrowthEventsList((prevRows) => [
        ...prevRows,
        {
          ...growthEventData,
          id:
            prevRows.length === 0
              ? 1
              : Math.max(...prevRows.map((row) => row.id)) + 1,
        },
      ]);
    }

    setGrowthEventData({
      id: 0,
      name: "",
      description: "",
      referenceStage: "",
      ETFromStageStart: "",
      ETFromStageStartUnit: "",
      timePeriod: "",
      timePeriodUnit: "",
    });
    setEditingRowId(null);
  };

  const handleEditEvent = (row: IGrowthEventData) => {
    setGrowthEventData(row);
    setEditingRowId(row.id);
  };

  const handleDeleteEvent = (id: number) => {
    setGrowthEventsList((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  // Subtim form

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleCancelOpen = () => {
    setCancel(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCancel(false);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      handleSubmitForm();
      setLoading(false);
      setOpen(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/species/list");
      }, 4000);
    }, 500);
  };

  const handleSubmitForm = async () => {
    try {
      setLoading(true);
      const speciesData = {
        species: {
          name: species.name,
          description: species.description,
          tenant_id: species.tenant_id,
        },
        stages: stagesList.map((stage: IStageData) => {
          return {
            db_id: stage.db_id,
            sequence_number: stage.id,
            name: stage.name,
            description: stage.description,
            estimated_time: stage.estimatedTime + " " + stage.estimatedTimeUnit,
            growthEvents: growthEventsList
              .filter((event) => event.referenceStage == stage.id)
              .map((event: IGrowthEventData) => {
                let time_period;
                if (
                  (event.timePeriod === "" && event.timePeriodUnit === "") ||
                  (event.timePeriod !== "" && event.timePeriodUnit !== "")
                ) {
                  time_period = event.timePeriod + " " + event.timePeriodUnit;
                }

                return {
                  name: event.name,
                  description: event.description,
                  et_from_stage_start:
                    event.ETFromStageStart + " " + event.ETFromStageStartUnit,
                  time_period,
                };
              }),
          };
        }),
      };

      if (editing) {
        await fetch(`${API}/species/${params.id}`, {
          method: "PUT",
          body: JSON.stringify(speciesData),
          headers: { "Content-type": "application/json" },
        });
      } else {
        await fetch(`${API}/speciesdata`, {
          method: "POST",
          body: JSON.stringify(speciesData),
          headers: { "Content-type": "application/json" },
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    navigate("/species/list");
  };

  // Cargar especie existente (caso de edicion)

  const [editing, setEditing] = useState(false);

  const loadSpecies = async (id: string) => {
    try {
      const res = await fetch(`${API}/speciesdata/${id}`);
      const data = await res.json();
      setSpecies(data.species);
      setStagesList(data.growth_stages);
      setGrowthEventsList(data.growth_events);
      console.log(data);
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
                        <IconButton
                          disabled={!selectedRowId}
                          onClick={handleMoveTopClick}
                        >
                          <DoubleUpIcon />
                        </IconButton>
                        <IconButton
                          disabled={!selectedRowId}
                          onClick={handleMoveUpClick}
                        >
                          <UpIcon />
                        </IconButton>
                        <IconButton
                          disabled={!selectedRowId}
                          onClick={handleMoveDownClick}
                        >
                          <DownIcon />
                        </IconButton>
                        <IconButton
                          disabled={!selectedRowId}
                          onClick={handleMoveBottomClick}
                        >
                          <DoubleDownIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stagesList.map((row) => (
                      <TableRow
                        key={row.id}
                        selected={row.id === selectedRowId}
                        onClick={() => setSelectedRowId(row.id)}
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
                          <Button onClick={() => handleDeleteStage(row.id)}>
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
                  {editingRowId !== null ? "Actualizar" : "Agregar"}
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
                          (stage) => stage.id === a.referenceStage
                        );
                        const stageB = stagesList.findIndex(
                          (stage) => stage.id === b.referenceStage
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
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            {
                              stagesList.find(
                                (stage) => stage.id === row.referenceStage
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
                            <Button onClick={() => handleDeleteEvent(row.id)}>
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
                        <MenuItem key={stage.id} value={stage.id}>
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
                      ? "El tiempo desde inicio de etapa debe ser menor a la duración de la etapa"
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
                  {editingRowId !== null ? "Actualizar" : "Agregar"}
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
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, ml: 1 }}
              onClick={handleCancelOpen}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, ml: 1 }}
              onClick={handleClickOpen}
              disabled={!species.name}
            >
              Confirmar
            </Button>
          </Box>
        </Paper>
      </Container>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Confirmar datos?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {editing
              ? "Se actualizará a la especie con todas sus fases y tareas."
              : "Se dará de alta a la especie con todas sus fases y tareas."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop open={loading} style={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {success && (
        <Dialog open={success}>
          <Alert severity="success" sx={{ width: "100%" }}>
            <AlertTitle>Datos cargados correctamente!</AlertTitle>
            Redirigiendo...
          </Alert>
        </Dialog>
      )}

      <Dialog
        open={cancel}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Cancelar carga?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Los datos ingresados no serán guardados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Quedarme aquí</Button>
          <Button onClick={handleCancel} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default SpeciesForm;
