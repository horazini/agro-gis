import { useEffect, useState } from "react";
import {
  MapContainer,
  Circle,
  LayerGroup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getGeoData } from "../../services/services";
import { Feature } from "geojson";

import {
  position,
  LayerControler,
  FormattedArea,
} from "../../components/mapcomponents";
import { Box, Card } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
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
      <MapView landplot={landplotData} />

      {landplotData && (
        <LandplotData landplot={landplotData.properties?.landplot} />
      )}

      {landplotData && <CropsDataGrid crops={landplotData.properties?.crops} />}
    </Box>
  );
};

const MapView = ({ landplot }: any) => {
  const CustomLayer = ({ feature }: any) => {
    const { landplot } = feature.properties;
    const { type, coordinates } = feature.geometry;

    const [isHighlighted, setIsHighlighted] = useState<boolean>(false);

    const handleLayerMouseOver = () => {
      setIsHighlighted(true);
    };

    const handleLayerMouseOut = () => {
      setIsHighlighted(false);
    };

    const pathOptions = {
      color: isHighlighted ? "#33ff33" : "#3388ff",
    };

    const eventHandlers = {
      mouseover: handleLayerMouseOver,
      mouseout: handleLayerMouseOut,
    };

    if (type === "Polygon") {
      const LatLngsCoordinates = coordinates[0].map(([lng, lat]: number[]) => [
        lat,
        lng,
      ]);
      return (
        <Polygon
          positions={LatLngsCoordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        />
      );
    } else if (type === "Point" && landplot.subType === "Circle") {
      return (
        <Circle
          center={coordinates}
          radius={landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        />
      );
    }
    return null;
  };

  function FlyToLayer() {
    let coords: LatLngExpression = position;
    if (landplot?.geometry.type === "Point") {
      coords = landplot.geometry.coordinates as LatLngExpression;
    }
    if (landplot?.geometry.type === "Polygon") {
      const LatLngsCoordinates: LatLngExpression[] =
        landplot.geometry.coordinates[0].map(([lng, lat]: number[]) => [
          lat,
          lng,
        ]);

      coords = L.polygon(LatLngsCoordinates).getBounds().getCenter();
    }
    const map = useMapEvents({
      layeradd() {
        map.flyTo(coords, 13);
      },
    });
    return null;
  }

  return (
    <Box mb={2}>
      <MapContainer center={position} zoom={7}>
        <LayerControler />
        <FlyToLayer />
        <LayerGroup>
          {landplot && <CustomLayer feature={landplot} />}
        </LayerGroup>
      </MapContainer>
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
