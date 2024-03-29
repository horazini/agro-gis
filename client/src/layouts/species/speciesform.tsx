import { Fragment, useState } from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  Box,
  Button,
  Container,
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
  Typography,
} from "@mui/material";

import { Apps as AppsIcon } from "@mui/icons-material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  getSpeciesData,
  postSpeciesData,
  putSpeciesData,
  speciesDataType,
} from "../../utils/services";
import {
  CancelButton,
  ConfirmButton,
  DataFetcher,
  DialogComponent,
  PageTitle,
} from "../../components/customComponents";
import { timeUnits } from "../../utils/functions";

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

const SpeciesFormLoader = ({ speciesId }: { speciesId: number }) => {
  const specieGetter = async () => {
    const data = await getSpeciesData(speciesId);
    return ["speciesInitData", data];
  };

  return (
    <DataFetcher getResourceFunctions={[specieGetter]}>
      {(params) => <SpeciesForm {...params} editingSpeciesId={speciesId} />}
    </DataFetcher>
  );
};

const SpeciesForm = ({
  speciesInitData,
  editingSpeciesId,
}: {
  speciesInitData: { species: ISpeciesData; stages: IStageData[] };
  editingSpeciesId?: number;
}): JSX.Element => {
  const { species: speciesInit, stages: stageListInit } = speciesInitData;

  const isEditingForm: boolean = editingSpeciesId !== undefined;

  const [deletedStages, setDeletedStages] = useState<number[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<number[]>([]);

  // Species main data

  const [species, setSpecies] = useState<ISpeciesData>(speciesInit);

  // Stages and events data

  const [stagesList, setStagesList] = useState<IStageData[]>(
    stageListInit || []
  );

  // Subtim form

  const handleSubmitForm: () => Promise<number> = async () => {
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
        const res = await putSpeciesData(updateData, Number(editingSpeciesId));
        return res;
      } else {
        const res = await postSpeciesData(speciesData);
        return res;
      }
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const msg: string = isEditingForm
    ? "Se actualizará a la especie con todas sus fases y tareas."
    : "Se dará de alta a la especie con todas sus fases y tareas.";

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          {isEditingForm ? "Editar especie" : "Agregar nueva especie"}
        </Typography>

        <SpeciesMainData species={species} setSpecies={setSpecies} />

        <SpeciesStages
          stagesList={stagesList}
          setStagesList={setStagesList}
          isEditingForm={isEditingForm}
          setDeletedStages={setDeletedStages}
        />

        <SpeciesEvents
          stagesList={stagesList}
          setStagesList={setStagesList}
          isEditingForm={isEditingForm}
          setDeletedEvents={setDeletedEvents}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CancelButton navigateDir={"/species"} />
          <ConfirmButton
            msg={msg}
            onConfirm={handleSubmitForm}
            navigateDir={"/species"}
            disabled={!species.name || stagesList.length === 0}
          />
        </Box>
      </Paper>
    </Container>
  );
};

const SpeciesMainData = ({
  species,
  setSpecies,
}: {
  species: ISpeciesData;
  setSpecies: React.Dispatch<React.SetStateAction<ISpeciesData>>;
}) => {
  const handleSpeciesChange = (e: {
    target: { name: string; value: string };
  }) => {
    setSpecies({ ...species, [e.target.name]: e.target.value });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
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
      <Grid item xs={12}>
        <TextField
          inputProps={{ maxLength: 500 }}
          id="description"
          name="description"
          label="Descripción"
          multiline
          fullWidth
          variant="standard"
          value={species.description || ""}
          onChange={handleSpeciesChange}
        />
      </Grid>
    </Grid>
  );
};

const SpeciesStages = ({
  stagesList,
  setStagesList,
  isEditingForm,
  setDeletedStages,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  isEditingForm: boolean;
  setDeletedStages: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const [stageData, setStageData] = useState<IStageData>(nullStageData);

  const [editingStageRowId, setEditingStageRowId] = useState<number | null>(
    null
  );

  const handleEditStage = (row: IStageData, index: number) => {
    setStageData(row);
    setEditingStageRowId(index);
  };

  const clearAllFields = () => {
    setStageData(nullStageData);
    setEditingStageRowId(null);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Etapas de crecimiento
      </Typography>

      <Grid container spacing={3}>
        <StagesList
          stagesList={stagesList}
          setStagesList={setStagesList}
          isEditingForm={isEditingForm}
          setDeletedStages={setDeletedStages}
          handleEditStage={handleEditStage}
          editingStageRowId={editingStageRowId}
          clearAllFields={clearAllFields}
        />
        <StageForm
          stagesList={stagesList}
          setStagesList={setStagesList}
          stageData={stageData}
          setStageData={setStageData}
          editingStageRowId={editingStageRowId}
          clearAllFields={clearAllFields}
        />
      </Grid>
    </Box>
  );
};

const StagesList = ({
  stagesList,
  setStagesList,
  isEditingForm,
  setDeletedStages,
  handleEditStage,
  editingStageRowId,
  clearAllFields,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  isEditingForm: boolean;
  setDeletedStages: React.Dispatch<React.SetStateAction<number[]>>;
  handleEditStage: (row: IStageData, index: number) => void;
  editingStageRowId: number | null;
  clearAllFields: () => void;
}) => {
  const handleDeleteStage = (index: number) => {
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

  // Rearrange Rows

  const [rearrangeRowsState, setRearrangeRowsState] = useState<{
    transferOrigin: null | number;
    transferTarget: null | number;
  }>({
    transferOrigin: null,
    transferTarget: null,
  });

  const onDragStart = (e: any, index: number) => {
    const rect = e.target.parentElement.parentElement.getBoundingClientRect(); // coords of the row in the screen
    const xOffset = e.clientX - rect.x;
    const yOffset = e.clientY - rect.y;

    e.dataTransfer.setDragImage(
      e.target.parentElement.parentElement,
      xOffset,
      yOffset
    );

    setRearrangeRowsState({
      ...rearrangeRowsState,
      transferOrigin: index,
    });
  };

  const onDragEnter = (e: any, index: number) => {
    e.preventDefault();
    setRearrangeRowsState({
      ...rearrangeRowsState,
      transferTarget: index,
    });
  };

  const onDragOver = (e: any) => {
    e.preventDefault();
  };

  const onDragEnd = (e: any) => {
    e.preventDefault();

    const { transferOrigin, transferTarget } = rearrangeRowsState;

    if (transferOrigin === null || transferTarget === null) {
      return;
    }

    const updatedStagesList = [...stagesList]; // Copies stagesList so it doesnt modify directly the state
    const movedStage = updatedStagesList[transferOrigin]; // Get element to move
    updatedStagesList.splice(transferOrigin, 1); // Deletes element from original array
    updatedStagesList.splice(transferTarget, 0, movedStage); // Inserts element in new position

    setStagesList(updatedStagesList);
    clearAllFields();
  };

  return (
    <Grid item xs={12}>
      <TableContainer component={Paper} style={{ padding: 10 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> </TableCell>
              <TableCell>Etapa</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Tiempo estimado</TableCell>
              <TableCell align="center">Opciones</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stagesList.length > 0 ? (
              stagesList.map((row, index) => (
                <TableRow key={index} selected={index === editingStageRowId}>
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
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditStage(row, index)}
                      size="small"
                    >
                      <EditIcon color="primary" />
                    </IconButton>

                    <DialogComponent
                      component={
                        <IconButton size="small">
                          <DeleteIcon color="primary" />
                        </IconButton>
                      }
                      dialogTitle={"¿Desea eliminar este elemento?"}
                      dialogSubtitle={
                        "Se eliminarán tambien sus tareas asignadas."
                      }
                      onConfirm={() => handleDeleteStage(index)}
                    />
                  </TableCell>
                  <TableCell align="right" width={50}>
                    <IconButton
                      sx={{ cursor: "move" }}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onDragEnter={(e: any) => onDragEnter(e, index)}
                      aria-label="expand row"
                      size="small"
                    >
                      <AppsIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {"Ingrese etapas"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

const StageForm = ({
  stagesList,
  setStagesList,
  stageData,
  setStageData,
  editingStageRowId,
  clearAllFields,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  stageData: IStageData;
  setStageData: React.Dispatch<React.SetStateAction<IStageData>>;
  editingStageRowId: number | null;
  clearAllFields: () => void;
}) => {
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

  const disableStageClean = () => {
    const { name, description, estimatedTime, estimatedTimeUnit } = stageData;

    return !name && !description && !estimatedTime && !estimatedTimeUnit;
  };

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

  return (
    <Grid item xs={12}>
      <Box sx={{ padding: 1 }} component={Paper}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {editingStageRowId !== null ? "Editar etapa" : "Agregar etapa"}
        </Typography>
        <TextField
          sx={{ my: 1 }}
          required
          label="Nombre"
          name="name"
          inputProps={{ maxLength: 100 }}
          value={stageData.name}
          onChange={handleStageChange}
        />
        <Grid item xs={12} lg={6}>
          <TextField
            sx={{ my: 1 }}
            label="Descripción"
            name="description"
            inputProps={{ maxLength: 500 }}
            multiline
            fullWidth
            value={stageData.description}
            onChange={handleStageChange}
          />
        </Grid>
        <TextField
          sx={{ my: 1 }}
          required
          label="Tiempo estimado"
          name="estimatedTime"
          value={stageData.estimatedTime}
          onChange={(e) => {
            var value = parseInt(e.target.value, 10);
            if (value > 9999) {
              return;
            } else {
              handleStageChange(e);
            }
          }}
          type="number"
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
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="submit"
            color="error"
            sx={{ margin: 1 }}
            onClick={clearAllFields}
            disabled={disableStageClean()}
          >
            {editingStageRowId !== null ? "Cancelar" : "Limpiar"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ margin: 1 }}
            onClick={handleStageSubmit}
            disabled={disableStageSubmit()}
          >
            {editingStageRowId !== null ? "Actualizar" : "Agregar"}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

const SpeciesEvents = ({
  stagesList,
  setStagesList,
  isEditingForm,
  setDeletedEvents,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  isEditingForm: boolean;
  setDeletedEvents: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const clearAllFields = () => {
    setGrowthEventData(nullGrowthEventData);
    setEditingEventRowId(null);
    setReferenceStage("");
  };

  const [editingEventRowId, setEditingEventRowId] = useState<number[] | null>(
    null
  );
  const [referenceStage, setReferenceStage] = useState<number | string>("");

  const [growthEventData, setGrowthEventData] =
    useState<IGrowthEventData>(nullGrowthEventData);

  const handleEditEvent = (row: IGrowthEventData, rowIndex: number[]) => {
    setGrowthEventData(row);
    setReferenceStage(rowIndex[0]);
    setEditingEventRowId(rowIndex);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Tareas agrícolas
      </Typography>

      <EventsList
        stagesList={stagesList}
        setStagesList={setStagesList}
        isEditingForm={isEditingForm}
        setDeletedEvents={setDeletedEvents}
        clearAllFields={clearAllFields}
        handleEditEvent={handleEditEvent}
      />

      <br />
      <EventsForm
        stagesList={stagesList}
        setStagesList={setStagesList}
        editingEventRowId={editingEventRowId}
        growthEventData={growthEventData}
        setGrowthEventData={setGrowthEventData}
        referenceStage={referenceStage}
        setReferenceStage={setReferenceStage}
        clearAllFields={clearAllFields}
      />
    </Box>
  );
};

const EventsList = ({
  stagesList,
  setStagesList,
  isEditingForm,
  setDeletedEvents,
  clearAllFields,
  handleEditEvent,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  isEditingForm: boolean;
  setDeletedEvents: React.Dispatch<React.SetStateAction<number[]>>;
  clearAllFields: () => void;
  handleEditEvent: (row: IGrowthEventData, rowIndex: number[]) => void;
}) => {
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TableContainer component={Paper} style={{ padding: 10 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarea</TableCell>
                <TableCell>Etapa</TableCell>
                <TableCell>Tiempo desde inicio de etapa</TableCell>
                <TableCell>Periodo de repetición</TableCell>
                <TableCell align="center">Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stagesList.map((stage, stageIndex) =>
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
                        Number(a.ETFromStageStart) - Number(b.ETFromStageStart)
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
                            (unit) => unit.key === event.ETFromStageStartUnit
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
                                (unit) => unit.key === event.timePeriodUnit
                              )?.label
                            }
                          </>
                        ) : null}
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          onClick={() =>
                            handleEditEvent(event, [stageIndex, eventIndex])
                          }
                        >
                          <EditIcon sx={{ mr: 1 }} />
                        </Button>
                        <DialogComponent
                          component={
                            <Button>
                              <DeleteIcon sx={{ mr: 1 }} />
                            </Button>
                          }
                          dialogTitle={"¿Desea eliminar este elemento?"}
                          dialogSubtitle={"Se eliminará de la lista de tareas."}
                          onConfirm={() =>
                            handleDeleteEvent(stageIndex, eventIndex)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

const EventsForm = ({
  stagesList,
  setStagesList,
  editingEventRowId,
  growthEventData,
  setGrowthEventData,
  referenceStage,
  setReferenceStage,
  clearAllFields,
}: {
  stagesList: IStageData[];
  setStagesList: React.Dispatch<React.SetStateAction<IStageData[]>>;
  editingEventRowId: number[] | null;
  growthEventData: IGrowthEventData;
  setGrowthEventData: React.Dispatch<React.SetStateAction<IGrowthEventData>>;
  referenceStage: string | number;
  setReferenceStage: React.Dispatch<React.SetStateAction<string | number>>;
  clearAllFields: () => void;
}) => {
  const disableEventClean = () => {
    const {
      ETFromStageStart,
      ETFromStageStartUnit,
      description,
      name,
      timePeriod,
      timePeriodUnit,
    } = growthEventData;

    return (
      !ETFromStageStart &&
      !ETFromStageStartUnit &&
      !description &&
      !name &&
      !timePeriod &&
      !timePeriodUnit
    );
  };

  const [timeFromStartError, setTimeFromStartError] = useState(false);

  const handleEventChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setGrowthEventData({ ...growthEventData, [name]: value });
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

  return (
    <Grid container>
      <Grid item xs={12} component={Paper}>
        <Typography variant="h6" sx={{ margin: 1 }}>
          {editingEventRowId !== null ? "Editar tarea" : "Agregar tarea"}
        </Typography>{" "}
        <Box>
          <TextField
            required
            label="Nombre"
            name="name"
            inputProps={{ maxLength: 100 }}
            sx={{ margin: 1 }}
            value={growthEventData.name}
            onChange={handleEventChange}
          />

          <Grid item xs={12} lg={6}>
            <TextField
              label="Descripción"
              name="description"
              inputProps={{ maxLength: 500 }}
              multiline
              fullWidth
              sx={{ margin: 1 }}
              value={growthEventData.description}
              onChange={handleEventChange}
            />
          </Grid>

          <FormControl required variant="outlined" sx={{ m: 1, minWidth: 220 }}>
            <InputLabel>Etapa</InputLabel>
            <Select
              name="referenceStage"
              value={referenceStage}
              label="Etapa"
              onChange={(event) => setReferenceStage(event.target.value)}
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
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              required
              label="Tiempo desde el inicio de la etapa"
              name="ETFromStageStart"
              sx={{ m: 1, minWidth: 500 }}
              value={growthEventData.ETFromStageStart}
              onChange={(e) => {
                var value = parseInt(e.target.value, 10);
                if (value > 9999) {
                  return;
                } else {
                  handleEventChange(e);
                }
              }}
              type="number"
              error={timeFromStartError}
              helperText={
                timeFromStartError
                  ? "El tiempo desde inicio de etapa debe ser menor a la duración de la misma"
                  : ""
              }
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
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
              sx={{ m: 1, minWidth: 500 }}
              value={growthEventData.timePeriod}
              onChange={(e) => {
                var value = parseInt(e.target.value, 10);
                if (value > 9999 || value < 1) {
                  return;
                } else {
                  handleEventChange(e);
                }
              }}
              type="number"
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
                      <MenuItem value="">No es una tarea periódica</MenuItem>
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
        </Box>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="submit"
            color="error"
            sx={{ margin: 1 }}
            onClick={clearAllFields}
            disabled={disableEventClean()}
          >
            {editingEventRowId !== null ? "Cancelar" : "Limpiar"}
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{ margin: 1 }}
            onClick={handleEventValidation}
            disabled={disableEventSubmit()}
          >
            {editingEventRowId !== null ? "Actualizar" : "Agregar"}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

const SpeciesFormMain = () => {
  const params = useParams();
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const speciesId = Number(params.id);

  const speciesInitData = {
    species: {
      id: null,
      name: "",
      description: "",
      tenant_id: Number(tenantId),
    },
    stages: [],
  };

  PageTitle(params.id ? "Editar especie" : "Agregar especie");

  return params.id ? (
    <SpeciesFormLoader speciesId={speciesId} />
  ) : (
    <SpeciesForm speciesInitData={speciesInitData} />
  );
};

export default SpeciesFormMain;
