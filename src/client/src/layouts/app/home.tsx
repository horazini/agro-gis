import {
  Box,
  Card,
  CardMedia,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { PageTitle } from "../../components/customComponents";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  getNextHarvest,
  getAvailableAndOccupiedTenantAreasSum,
  getTenantPendingTasksNumber,
  getTenantSpeciesCropsAreasSum,
  getWeather,
} from "../../utils/services";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { formatedDate } from "../../utils/functions";
import { FormattedArea } from "../../components/mapcomponents";
import { WMOcodesInterpretation } from "../../utils/wmo_weather_condition_codes_interpretation";

const DashboardLoader = () => {
  PageTitle("Inicio");
  const navigate = useNavigate();

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [nextHarvest, setNextHarvest] = useState();
  const [areasSum, setAreasSum] = useState();
  const [cultivatedAreaBySpecies, setCultivatedAreaBySpecies] = useState();
  const [pendingTasksNumber, setPendingTasksNumber] = useState();
  const [weatherReport, setWeatherReport] = useState();

  const loadMainData = async (id: number) => {
    try {
      const nextHarvestData = await getNextHarvest(id);
      setNextHarvest(nextHarvestData);
      const areasData = await getAvailableAndOccupiedTenantAreasSum(id);
      setAreasSum(areasData);
      const cultivatedAreaBySpeciesData = await getTenantSpeciesCropsAreasSum(
        id
      );
      setCultivatedAreaBySpecies(cultivatedAreaBySpeciesData);
      const pendingTasksNumberRes = await getTenantPendingTasksNumber(id);
      setPendingTasksNumber(pendingTasksNumberRes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadMainData(tenantId);
    }
  }, [tenantId]);

  //#region geolocation

  const [coords, setCoords] = useState([
    -27.469999313354492, -58.83000183105469,
  ]);

  const loadWeatherData = async () => {
    try {
      const weatherRes = await getWeather(coords);
      setWeatherReport(weatherRes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, [coords]);

  var getPositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  function success(pos: { coords: any }) {
    var crd = pos.coords;
    const locatedCoords = [crd.latitude, crd.longitude];
    setCoords(locatedCoords);
  }

  function errors(err: { code: any; message: any }) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              success,
              errors,
              getPositionOptions
            );
          } else if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              success,
              errors,
              getPositionOptions
            );
          } else if (result.state === "denied") {
            window.alert(
              "Habilite la ubicación geográfica para una mejor experiencia."
            );
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  //#endregion

  const data = {
    nextHarvest,
    areasSum,
    cultivatedAreaBySpecies,
    pendingTasksNumber,
    weatherReport,
  };
  return <Fragment>{data && Dashboard(data, navigate)}</Fragment>;
};

const Dashboard = (data: any, navigate: any) => {
  const {
    nextHarvest,
    areasSum,
    cultivatedAreaBySpecies,
    pendingTasksNumber,
    weatherReport,
  } = data;
  return (
    <Container maxWidth="xl" sx={{ paddingBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Paper
            sx={{
              pt: 1,
              pl: 2,
              pr: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {pendingTasksNumber ? (
              <Fragment>
                {PendingTasksPanel(pendingTasksNumber, navigate)}
              </Fragment>
            ) : null}
          </Paper>
        </Grid>
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
            {areasSum ? (
              <Fragment>{LandplotAreasPanel(areasSum, navigate)}</Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              pt: 1,
              pl: 2,
              pr: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {nextHarvest ? (
              <Fragment>{NextHarvestPanel(nextHarvest, navigate)}</Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              pt: 1,
              pl: 2,
              pr: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {weatherReport ? (
              <Fragment>{WeatherReportPanel(weatherReport)}</Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
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
            {cultivatedAreaBySpecies ? (
              <Fragment>
                {CropsBySpeciePanel(cultivatedAreaBySpecies, navigate)}
              </Fragment>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const LandplotAreasPanel = (areasSum: any, navigate: any) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const { occupiedAreasSum, availableAreasSum } = areasSum;

  const pieData = {
    labels: ["Ocupado", "Libre"],
    datasets: [
      {
        label: "Área",
        data: [occupiedAreasSum, availableAreasSum],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie
      style={{
        cursor: "pointer",
      }}
      onClick={() => navigate(`/landplots`)}
      data={pieData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "bottom" as const,
          },
          title: {
            display: true,
            text: "Porcentaje de tierras ocupadas",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let formatedArea = FormattedArea(context.parsed);
                let label = context.dataset.label + ": " + formatedArea;

                return label;
              },
            },
          },
        },
      }}
    />
  );
};

const PendingTasksPanel = (pendingTasksNumber: any, navigate: any) => {
  return (
    <Fragment>
      <p>Tareas pendientes</p>
      <Box
        style={{
          paddingLeft: 10,
          cursor: "pointer",
          display: "flex",
          flexFlow: "column",
          height: "100%",
        }}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : "#121212",
        }}
        onClick={() => navigate(`/calendar`)}
      >
        <p>Actualmente hay {pendingTasksNumber} tareas pendientes.</p>
      </Box>
    </Fragment>
  );
};

const NextHarvestPanel = (nextHarvest: any, navigate: any) => {
  const { id, landplot_id, species_name, estimatedCropFinishDate } =
    nextHarvest;

  return (
    <Fragment>
      <p>Próxima cosecha</p>
      <Box
        style={{
          paddingLeft: 10,
          cursor: "pointer",
          display: "flex",
          flexFlow: "column",
          height: "100%",
        }}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : "#121212",
        }}
        onClick={() => navigate(`/crops/${id}`)}
      >
        <p>
          Parcela N°. {landplot_id} - {species_name}
        </p>

        <p>Fecha estimada: {formatedDate(estimatedCropFinishDate)}</p>
      </Box>
    </Fragment>
  );
};

const CropsBySpeciePanel = (cultivatedAreaBySpecies: any, navigate: any) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Área cultivada por especie",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let formatedArea = FormattedArea(context.parsed.y);
            let label = context.dataset.label + ": " + formatedArea;

            return label;
          },
        },
      },
    },
  };

  const barData = {
    labels: ["Especies"],
    datasets: cultivatedAreaBySpecies,
  };

  return (
    <Fragment>
      <Bar options={barOptions} data={barData} />
    </Fragment>
  );
};

const WeatherReportPanel = (weatherReport: any) => {
  const { formated_location_name, current } = weatherReport;
  const { is_day, weather_code, wind_direction_10m } = current;

  function formatWindDirectionDegrees(windDirectionDegrees: number): string {
    if (windDirectionDegrees > 45 && windDirectionDegrees < 136) {
      return "Este";
    } else if (windDirectionDegrees > 135 && windDirectionDegrees < 226) {
      return "Sur";
    } else if (windDirectionDegrees > 225 && windDirectionDegrees < 316) {
      return "Oeste";
    } else {
      return "Norte";
    }
  }

  function formatWeatherParameter(parameter: string): string {
    const unit = weatherReport.current_units[parameter];
    const value = weatherReport.current[parameter];

    return `${value} ${unit}`;
  }

  const WeatherCondition = (): {
    description: string;
    image: string;
  } => {
    const asd = WMOcodesInterpretation[weather_code];

    let conditionData;

    if (is_day === 1) {
      conditionData = asd.day;
    } else {
      conditionData = asd.night;
    }

    return conditionData;
  };

  return (
    <Fragment>
      <Box
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Card sx={{ boxShadow: 0 }}>
          <CardMedia
            component="img"
            image={WeatherCondition().image}
            height="70"
          />
        </Card>
        <Box>
          <Typography variant="h6">{formated_location_name}</Typography>
          <Typography variant="body1" marginBottom={2}>
            {WeatherCondition().description}
          </Typography>
        </Box>
      </Box>

      <Box
        style={{
          paddingLeft: 10,
          cursor: "pointer",
          display: "flex",
          flexFlow: "column",
          height: "100%",
        }}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : "#121212",
        }}
        onClick={() => {
          window.location.href = "https://openweathermap.org/";
        }}
      >
        <Typography variant="body1" paddingTop={2} marginBottom={2}>
          Temperatura: {formatWeatherParameter("temperature_2m")}
          <br />
          Humedad: {formatWeatherParameter("relative_humidity_2m")}
          <br />
          Sensación térmica: {formatWeatherParameter("apparent_temperature")}
          <br />
          Prob. de precipitaciones:{" "}
          {formatWeatherParameter("precipitation_probability")}
          <br />
          Precipitaciones en la última hora:{" "}
          {formatWeatherParameter("precipitation")}
          <br />
          Viento: {formatWeatherParameter("wind_speed_10m")}{" "}
          {formatWindDirectionDegrees(wind_direction_10m)}
        </Typography>
      </Box>
    </Fragment>
  );
};

export default DashboardLoader;
