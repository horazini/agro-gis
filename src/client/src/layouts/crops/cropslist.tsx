import { Box } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormatListBulleted } from "@mui/icons-material";

import { getTenantCrops } from "../../services/services";
import PageTitle from "../../components/title";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { FormattedArea } from "../../components/mapcomponents";
import { formatedDate } from "../../components/customComponents";

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

  return (
    <Fragment>
      <h1>Cultivos</h1>
      {crops.length > 0 ? (
        <Box sx={{ height: 400, width: "100%" }}>
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
