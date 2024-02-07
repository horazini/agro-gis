import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { getLandplotData } from "../../utils/services";
import { Feature } from "geojson";

import {
  FormattedArea,
  SentinelSnapshoter,
} from "../../components/mapcomponents";
import { Box, Button, Card } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FormatListBulleted, PhotoSizeSelectActual } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { PageTitle } from "../../components/customComponents";
import { formatedDate } from "../../utils/functions";

const CropDetailsLoader = () => {
  const params = useParams();
  PageTitle(`Parcela N.° ${params.id}`);

  const [landplotData, setLandplotData] = useState<Feature>();

  const loadCrop = async (id: string) => {
    try {
      const data = await getLandplotData(Number(id));
      setLandplotData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadCrop(params.id);
    }
  }, [params.id]);

  return landplotData ? <CropDetails landplotData={landplotData} /> : <div />;
};

const CropDetails = ({ landplotData }: { landplotData: Feature }) => {
  const navigate = useNavigate();

  const landplot = landplotData.properties?.landplot;

  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Parcela N.° {landplotData.properties?.landplot.id}</h1>
      <SentinelSnapshoter landplot={landplotData} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box paddingTop={2} ml={2} mb={2} mr={2}>
          <p>Parcela N.° {landplot.id}</p>
          {landplot.description && <p>Descripción: {landplot.description}</p>}
          {landplot.area && <p>Área: {FormattedArea(landplot.area)} </p>}
          {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
        </Box>

        <Button
          variant={"contained"}
          color="primary"
          onClick={() => navigate(`/landplots/${landplot.id}/snapshots`)}
          style={{ marginLeft: ".5rem" }}
          startIcon={<PhotoSizeSelectActual />}
        >
          Ver snapshots
        </Button>
      </Box>
      <CropsDataGrid crops={landplotData.properties?.crops} />
    </Box>
  );
};

const CropsDataGrid = ({ crops }: any) => {
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "",
      renderCell: (params: GridRenderCellParams<any>) => (
        <Box alignItems={"center"}>
          <FormatListBulleted
            onClick={() => navigate(`/crops/${params.value}`)}
            sx={{ cursor: "pointer" }}
          />
        </Box>
      ),

      width: 55,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: "species_name",
      headerName: "Especie",
      width: 160,
    },
    {
      field: "description",
      headerName: "Descripción",
      width: 160,
      sortable: false,
    },
    {
      field: "comments",
      headerName: "Comentarios",
      width: 160,
      sortable: false,
    },
    {
      field: "start_date",
      headerName: "Fecha de inicio",
      width: 150,
      valueFormatter: (params: GridValueFormatterParams<string>) => {
        if (params.value == null) {
          return "";
        }
        return formatedDate(params.value);
      },
    },
    {
      field: "finish_date",
      headerName: "Fecha de finalización",
      width: 150,
      valueFormatter: (params: GridValueFormatterParams<string>) => {
        if (params.value == null) {
          return "";
        }
        return formatedDate(params.value);
      },
    },
    {
      field: "weight_in_tons",
      headerName: "Peso cosecha",
      type: "number",
      width: 120,
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? theme.palette.grey[100] : null,
      }}
    >
      <Box ml={2} mb={2} mr={2}>
        <h2>Cultivos</h2>

        {crops.length > 0 ? (
          <DataGrid
            rows={crops}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light" ? theme.palette.grey[50] : null,
            }}
          />
        ) : (
          <h3>La parcela no registra cultivos</h3>
        )}
      </Box>
    </Card>
  );
};

export default CropDetailsLoader;
