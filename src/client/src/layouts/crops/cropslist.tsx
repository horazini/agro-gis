import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Add as AddIcon,
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  HowToReg as HowToRegIcon,
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
  DeleteRounded,
} from "@mui/icons-material";

import { getTenantCrops } from "../../services/services";
import {
  ConfirmDialog,
  UsertypeIDToString,
} from "../../components/customComponents";
import PageTitle from "../../components/title";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { FormattedArea } from "../../components/mapcomponents";

interface user {
  id: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  deleted: boolean;
}

function formatedDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}

const CropsList = (crops: any[]) => {
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
      field: "landplot_id",
      headerName: "ID parcela",
      type: "number",
      width: 90,
    },
    {
      field: "landplot_description",
      headerName: "Descripción parcela",
      width: 110,
      sortable: false,
    },
    {
      field: "landplot_area",
      headerName: "Área",
      type: "number",
      width: 90,
      valueFormatter: (params: GridValueFormatterParams<string>) => {
        if (params.value == null) {
          return "";
        }
        return FormattedArea(Number(params.value));
      },
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

  const rows = [
    {
      id: 28,
      landplot_id: 54,
      landplot_area: "286355",
      landplot_description: null,
      species_name: "eucaliptus",
      description: null,
      comments: null,
      start_date: "2023-08-19T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 30,
      landplot_id: 50,
      landplot_area: "209005",
      landplot_description: null,
      species_name: "Nombre especie",
      description: null,
      comments: null,
      start_date: "2023-08-10T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 31,
      landplot_id: 55,
      landplot_area: "305796",
      landplot_description: null,
      species_name: "Jengibre",
      description: null,
      comments: null,
      start_date: "2023-08-11T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 29,
      landplot_id: 44,
      landplot_area: "29587",
      landplot_description: null,
      species_name: "Cebollita verdeo",
      description: null,
      comments: null,
      start_date: "2023-08-09T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 32,
      landplot_id: 43,
      landplot_area: "4943",
      landplot_description: null,
      species_name: "Mandioca",
      description: null,
      comments: null,
      start_date: "2023-09-01T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 33,
      landplot_id: 42,
      landplot_area: "4773",
      landplot_description: null,
      species_name: "Cebollita verdeo",
      description: null,
      comments: null,
      start_date: "2023-09-06T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
    {
      id: 34,
      landplot_id: 88,
      landplot_area: "11973",
      landplot_description: null,
      species_name: "Nombre especie",
      description: null,
      comments: null,
      start_date: "2023-09-06T03:00:00.000Z",
      finish_date: null,
      weight_in_tons: null,
      deleted: null,
    },
  ];

  return (
    <Fragment>
      <h1>Cultivos</h1>
      {crops.length > 0 ? (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
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
      ) : (
        <h3> El cliente no registra cultivos. </h3>
      )}
    </Fragment>
  );
};

const TenantDetails = () => {
  PageTitle("Cultivos");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [crops, setCrops] = useState<[]>([]);

  const loadTenant = async (id: number) => {
    try {
      const data = await getTenantCrops(id);
      setCrops(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId]);

  return <Fragment>{CropsList(crops)}</Fragment>;
};

export default TenantDetails;
