import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { getGeoData } from "../../services/services";
import { Feature } from "geojson";

import {
  FormattedArea,
  SentinelSnapshoter,
} from "../../components/mapcomponents";
import { Box, Card } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FormatListBulleted } from "@mui/icons-material";
import { formatedDate } from "../../components/customComponents";

import PageTitle from "../../components/title";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from "@mui/x-data-grid";

const CropDetails = () => {
  const params = useParams();
  PageTitle(`Parcela N.° ${params.id}`);

  const [landplotData, setLandplotData] = useState<Feature>();

  const loadCrop = async (id: string) => {
    try {
      const data = await getGeoData(Number(id));
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

  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {landplotData && (
        <h1>Parcela N.° {landplotData.properties?.landplot.id}</h1>
      )}
      <SentinelSnapshoter landplot={landplotData} />

      {landplotData && (
        <LandplotData landplot={landplotData.properties?.landplot} />
      )}

      {landplotData && <CropsDataGrid crops={landplotData.properties?.crops} />}
    </Box>
  );
};

const LandplotData = ({ landplot }: any) => {
  return (
    <Box ml={2} mb={2} mr={2}>
      {landplot.description && <p>Descripción: {landplot.description}</p>}
      <p>Área: {FormattedArea(landplot.area)} m.</p>
      {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
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
            onClick={() => navigate(`/cropdetails/${params.value}`)}
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
        <Box style={{ display: "flex", justifyContent: "space-between" }}></Box>
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
      </Box>
    </Card>
  );
};

export default CropDetails;
