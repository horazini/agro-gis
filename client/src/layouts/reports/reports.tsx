import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, SetStateAction, useEffect, useState } from "react";

import {
  Inventory as InventoryIcon,
  Layers as LayersIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

import {
  getLandplotReport,
  getSpeciesReport,
  getTenantGeo,
  getTenantSpecies,
  speciesMainData,
} from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  CircularProgressBackdrop,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
  mySnackBars,
} from "../../components/customComponents";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  FlyToSelectedFeatureMap,
  FeaturesHeatMap,
  FormattedArea,
  OneFeatureMap,
} from "../../components/mapcomponents";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  Title,
  Colors,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { formatedDate } from "../../utils/functions";

const { errorSnackBar } = mySnackBars;

const ReportsLoader = () => {
  PageTitle("Reportes estadísticos");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [landplots, setLandplots] = useState<any>();
  const [species, setSpecies] = useState<speciesMainData[]>([]);

  const loadLandplots = async () => {
    if (tenantId) {
      const data = await getTenantGeo(tenantId);
      setLandplots(data);
    }
  };

  const loadSpecies = async () => {
    if (tenantId) {
      const data = await getTenantSpecies(tenantId);
      setSpecies(data);
    }
  };

  useEffect(() => {
    loadLandplots();
    loadSpecies();
  }, []);

  return <StatisticalReports species={species} landplots={landplots} />;
};

const StatisticalReports = ({
  species,
  landplots,
}: {
  species: any[];
  landplots: any[];
}) => {
  const [reportRequest, setReportRequest] = useState<{
    class: null | string;
    objectId: number;
    fromDate: null | string;
    toDate: null | string;
  }>({
    class: null,
    objectId: 0,
    fromDate: null,
    toDate: null,
  });

  const [reportResponse, setReportResponse] = useState<any>(null);

  async function handleGetReport() {
    setLoading(true);
    try {
      let res = null;
      if (reportRequest.class === "species") {
        const ReportSentData = {
          speciesId: reportRequest.objectId,
          fromDate: reportRequest.fromDate,
          toDate: reportRequest.toDate,
        };
        res = await getSpeciesReport(ReportSentData);
      } else if (reportRequest.class === "landplot") {
        const ReportSentData = {
          landplotId: reportRequest.objectId,
          fromDate: reportRequest.fromDate,
          toDate: reportRequest.toDate,
        };
        res = await getLandplotReport(ReportSentData);
      }

      if (res?.status === 200) {
        const reportResponse = res.data;
        setReportResponse(reportResponse);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  }

  //#region Snackbar

  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

  //#endregion

  const [loading, setLoading] = useState(false);

  return (
    <Fragment>
      <h1>Reportes estadísticos</h1>

      {reportResponse === null ? (
        <ReportRequestMenu
          species={species}
          landplots={landplots}
          reportRequest={reportRequest}
          setReportRequest={setReportRequest}
          handleGetReport={handleGetReport}
        />
      ) : (
        <ReportResponseDisplay
          reportResponse={reportResponse}
          setReportResponse={setReportResponse}
          setReportRequest={setReportRequest}
        />
      )}

      <Fragment>
        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          setSnackBar={setSnackBar}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
    </Fragment>
  );
};

const ReportRequestMenu = ({
  species,
  landplots,
  reportRequest,
  setReportRequest,
  handleGetReport,
}: any) => {
  return (
    <Fragment>
      <Box paddingBottom={3}>
        <Button
          variant={reportRequest.class === "species" ? "contained" : "outlined"}
          color="primary"
          onClick={() => {
            reportRequest.class === "species"
              ? console.log()
              : setReportRequest((prevReport: any) => ({
                  ...prevReport,
                  class: "species",
                  objectId: 0,
                }));
          }}
          style={{ marginLeft: ".5rem" }}
          startIcon={<InventoryIcon />}
          size="large"
        >
          Por especie
        </Button>
        <Button
          variant={
            reportRequest.class === "landplot" ? "contained" : "outlined"
          }
          color="primary"
          onClick={() => {
            reportRequest.class === "landplot"
              ? console.log()
              : setReportRequest((prevReport: any) => ({
                  ...prevReport,
                  class: "landplot",
                  objectId: 0,
                }));
          }}
          style={{ marginLeft: ".5rem" }}
          startIcon={<LayersIcon />}
          size="large"
        >
          Por parcela
        </Button>
      </Box>
      <Box paddingBottom={3}>
        {reportRequest.class === "species" ? (
          <Fragment>
            {SpeciesReportRequest(species, reportRequest, setReportRequest)}
          </Fragment>
        ) : reportRequest.class === "landplot" ? (
          <Fragment>
            {LandplotReportRequest(landplots, reportRequest, setReportRequest)}
          </Fragment>
        ) : null}
      </Box>
      {reportRequest.class !== null ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant={"contained"}
            color="primary"
            onClick={handleGetReport}
            style={{ marginLeft: ".5rem" }}
            startIcon={<ArticleIcon />}
            disabled={!Object.values(reportRequest).every((value) => !!value)}
          >
            Obtener reporte
          </Button>
        </Box>
      ) : null}
    </Fragment>
  );
};

const SpeciesReportRequest = (
  species: speciesMainData[],
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReportRequest: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
          {species ? (
            <Autocomplete
              id="species-autocomplete"
              options={species}
              getOptionLabel={(option: any) => option.name}
              value={
                species.find((specie: any) => specie.id === report.objectId) ||
                null
              }
              onChange={(_, newValue) =>
                setReportRequest((prevReport) => ({
                  ...prevReport,
                  objectId: newValue?.id || 0,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Especie" />
              )}
            />
          ) : null}
        </FormControl>
        {DatesSelector(report, setReportRequest)}
      </Box>
    </Fragment>
  );
};

const LandplotReportRequest = (
  landplots: { features: any[]; type: string },
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReportRequest: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  const handleFeatureSelect = (value: number) => {
    setReportRequest((prevReport) => ({
      ...prevReport,
      objectId: value,
    }));
  };

  return (
    <Fragment>
      <Box>
        {landplots && (
          <Box paddingBottom={3}>
            <FlyToSelectedFeatureMap
              features={landplots.features}
              selectedLandplotId={report.objectId}
              handleFeatureClick={handleFeatureSelect}
            />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
            {landplots ? (
              <Autocomplete
                id="landplot-autocomplete"
                options={landplots.features.sort(
                  (a: any, b: any) =>
                    a.properties.landplot.id - b.properties.landplot.id
                )}
                getOptionLabel={(option: any) =>
                  "Parcela " +
                  option.properties.landplot.id +
                  (option.properties.landplot.description
                    ? " - " + option.properties.landplot.description
                    : "")
                }
                value={
                  landplots.features.find(
                    (feature: any) =>
                      feature.properties.landplot.id === report.objectId
                  ) || null
                }
                onChange={(_, newValue) =>
                  setReportRequest((prevReport) => ({
                    ...prevReport,
                    objectId: newValue?.properties.landplot.id || 0,
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Parcela" />
                )}
              />
            ) : null}
          </FormControl>
          {DatesSelector(report, setReportRequest)}
        </Box>
      </Box>
    </Fragment>
  );
};

const DatesSelector = (
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReportRequest: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  function handleDateChange(date: any, pickerName: string) {
    if (date !== null && !Number.isNaN(new Date(date).getTime())) {
      const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601

      setReportRequest((prevReport) => ({
        ...prevReport,
        [pickerName]: isoDate,
      }));
    }
  }

  return (
    <Box>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <DatePicker
          showDaysOutsideCurrentMonth
          format="DD/MM/YYYY"
          label="Desde"
          value={report.fromDate ? dayjs(report.fromDate) : null}
          onChange={(e) => handleDateChange(e, "fromDate")}
          maxDate={dayjs(report.toDate)}
        />
      </FormControl>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <DatePicker
          showDaysOutsideCurrentMonth
          format="DD/MM/YYYY"
          label="Hasta"
          value={report.toDate ? dayjs(report.toDate) : null}
          onChange={(e) => handleDateChange(e, "toDate")}
          minDate={dayjs(report.fromDate)}
        />
      </FormControl>
    </Box>
  );
};

const ReportResponseDisplay = ({
  reportResponse,
  setReportResponse,
  setReportRequest,
}: any) => {
  const { reportQuery, totals } = reportResponse;

  const reportResponseIsNull = Object.values(totals).every(
    (value) => value === 0
  );

  const { reportClass, name, description, Feature, fromDate, toDate } =
    reportQuery;

  const { cultivatedAreas, numberOfCrops, weightInTons } = totals;
  return (
    <Fragment>
      <Box paddingBottom={3}>
        <Typography>
          {reportClass === "species"
            ? `Especie: ${name}`
            : `Parcela ${Feature?.properties?.id}`}
        </Typography>
        <Typography>
          {description ? `Descripción: ${description}` : null}
        </Typography>
        <Typography>
          Periodo: Desde el {formatedDate(fromDate)} hasta el{" "}
          {formatedDate(toDate)}.
        </Typography>
      </Box>

      {!reportResponseIsNull ? (
        <Fragment>
          {reportClass === "species" ? (
            <SpeciesReportDispay reportResponse={reportResponse} />
          ) : reportClass === "landplot" ? (
            <LandplotReportDispay reportResponse={reportResponse} />
          ) : null}

          <Box paddingBottom={3}>
            <h2>Totales</h2>{" "}
            <Typography>Cosechas realizadas: {numberOfCrops}.</Typography>
            <Typography>
              Área cultivada: {FormattedArea(cultivatedAreas)}
            </Typography>
            <Typography>Peso recolectado: {weightInTons} toneladas.</Typography>
          </Box>
        </Fragment>
      ) : (
        <h3>
          No se registran cultivos para esta{" "}
          {reportClass === "species" ? "especie" : "parcela"} en el periodo{" "}
          {formatedDate(fromDate)} - {formatedDate(toDate)}.
        </h3>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Button
          startIcon={<ArticleIcon />}
          variant={"contained"}
          onClick={() => {
            setReportRequest({
              class: null,
              objectId: 0,
              fromDate: null,
              toDate: null,
            });

            setReportResponse(null);
          }}
        >
          Generar nuevo reporte
        </Button>
      </Box>
    </Fragment>
  );
};

const SpeciesReportDispay = ({ reportResponse }: any) => {
  ChartJS.register(ArcElement, Colors, Tooltip, Legend, Title);

  const { landplots } = reportResponse;
  const [targetVariable, setTargetVariable] = useState("weight");

  const labels = landplots.map(
    (landplot: any) => `Parcela ${landplot.properties.landplot.id}`
  );

  const WeightInTonsData = {
    labels,
    datasets: [
      {
        label: "Peso total cosechado",
        data: landplots.map(
          (landplot: any) => landplot.properties.totalweightintons
        ),
      },
    ],
  };

  const HarvestedAreaData = {
    labels,
    datasets: [
      {
        label: "Área total cosechada",
        data: landplots.map(
          (landplot: any) =>
            parseInt(landplot.properties.landplot.area, 10) *
            landplot.properties.numberofcrops
        ),
      },
    ],
  };

  const NumberOfCropsData = {
    labels,
    datasets: [
      {
        label: "# de cosechas realizadas",
        data: landplots.map(
          (landplot: any) => landplot.properties.numberofcrops
        ),
      },
    ],
  };

  return (
    <Fragment>
      <Box paddingBottom={3}>
        <FeaturesHeatMap
          features={landplots}
          targetProp={
            targetVariable === "weight"
              ? "totalweightintons"
              : targetVariable === "area"
              ? "landplot.area"
              : "numberofcrops"
          }
        />
      </Box>

      <Grid
        container
        direction="column"
        spacing={3}
        alignItems="center"
        justifyContent="center"
      >
        <ChartModeSelector
          variable={targetVariable}
          setVariable={setTargetVariable}
        />
        <Grid item xs={12} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              height: 290,
            }}
          >
            <Pie
              style={{
                cursor: "pointer",
              }}
              data={
                targetVariable === "weight"
                  ? WeightInTonsData
                  : targetVariable === "area"
                  ? HarvestedAreaData
                  : NumberOfCropsData
              }
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                  title: {
                    display: true,
                    text:
                      targetVariable === "weight"
                        ? "Peso total cosechado"
                        : targetVariable === "area"
                        ? "Área total cosechada"
                        : "Número de cosechas realizadas",

                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        if (targetVariable === "weight") {
                          return (
                            context.dataset.label +
                            ": " +
                            String(context.parsed) +
                            " toneladas"
                          );
                        } else if (targetVariable === "area") {
                          let formatedArea = FormattedArea(context.parsed);
                          let label =
                            context.dataset.label + ": " + formatedArea;
                          return label;
                        }
                      },
                    },
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  );
};

const LandplotReportDispay = ({ reportResponse }: any) => {
  ChartJS.register(ArcElement, Colors, Tooltip, Legend, Title);

  const { reportQuery, species } = reportResponse;

  const [targetVariable, setTargetVariable] = useState("weight");

  const labels = species.map((specie: any) => specie.species_name);

  const WeightInTonsData = {
    labels,
    datasets: [
      {
        label: "Peso total cosechado",
        data: species.map((specie: any) => specie.totalweightintons),
      },
    ],
  };

  const HarvestedAreaData = {
    labels,
    datasets: [
      {
        label: "Área total cosechada",
        data: species.map(
          (specie: any) =>
            parseInt(reportQuery.Feature.properties.area, 10) *
            specie.numberofcrops
        ),
      },
    ],
  };

  const NumberOfCropsData = {
    labels,
    datasets: [
      {
        label: "# de cosechas realizadas",
        data: species.map((specie: any) => specie.numberofcrops),
      },
    ],
  };

  return (
    <Fragment>
      <Box paddingBottom={3}>
        <OneFeatureMap feature={reportQuery.Feature} />
      </Box>
      <Grid
        container
        direction="column"
        spacing={3}
        alignItems="center"
        justifyContent="center"
      >
        <ChartModeSelector
          variable={targetVariable}
          setVariable={setTargetVariable}
        />

        <Grid item xs={12} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              height: 290,
            }}
          >
            <Pie
              style={{
                cursor: "pointer",
              }}
              data={
                targetVariable === "weight"
                  ? WeightInTonsData
                  : targetVariable === "area"
                  ? HarvestedAreaData
                  : NumberOfCropsData
              }
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                  title: {
                    display: true,
                    text:
                      targetVariable === "weight"
                        ? "Peso total cosechado"
                        : targetVariable === "area"
                        ? "Área total cosechada"
                        : "Número de cosechas realizadas",

                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        if (targetVariable === "weight") {
                          return (
                            context.dataset.label +
                            ": " +
                            String(context.parsed) +
                            " toneladas"
                          );
                        } else if (targetVariable === "area") {
                          let formatedArea = FormattedArea(context.parsed);
                          let label =
                            context.dataset.label + ": " + formatedArea;
                          return label;
                        }
                      },
                    },
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  );
};

const ChartModeSelector = ({ variable, setVariable }: any) => {
  return (
    <Box paddingTop={3}>
      <Button
        variant={variable === "weight" ? "contained" : "outlined"}
        color="primary"
        onClick={() => setVariable("weight")}
        style={{ marginLeft: ".5rem" }}
        size="small"
      >
        Peso
      </Button>
      <Button
        variant={variable === "area" ? "contained" : "outlined"}
        color="primary"
        onClick={() => setVariable("area")}
        style={{ marginLeft: ".5rem" }}
        size="small"
      >
        Área
      </Button>
      <Button
        variant={variable === "number" ? "contained" : "outlined"}
        color="primary"
        onClick={() => setVariable("number")}
        style={{ marginLeft: ".5rem" }}
        size="small"
      >
        Número de cosechas
      </Button>
    </Box>
  );
};

export default ReportsLoader;
