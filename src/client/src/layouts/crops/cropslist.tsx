import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormatListBulleted } from "@mui/icons-material";

import { getTenantCrops } from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { FormattedArea } from "../../components/mapcomponents";
import { formatedDate } from "../../utils/functions";
import { PageTitle } from "../../components/customComponents";

const CropsList = (crops: any[]) => {
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
      field: "landplot_id",
      headerName: "Parcela",
      width: 100,
      renderCell: (params: GridRenderCellParams<any>) => (
        <p>
          {params.id}
          {params.row.landplot_description
            ? " - " + params.row.landplot_description
            : null}
        </p>
      ),
    },
    {
      field: "landplot_area",
      headerName: "Área",
      type: "number",
      width: 120,
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
      renderCell: (params: GridRenderCellParams<any>) => {
        if (params.value === null) {
          return "";
        }
        const Pvalue = params.value;
        return Pvalue + " toneladas";
      },
    },
  ];

  const options = [
    { label: "No filtrar", value: "any" },
    { label: "Pendientes", value: "todo" },
    { label: "Realizados", value: "done" },
  ];

  const [status, setStatus] = useState("any");

  let filteredCrops = crops;
  if (status === "done") {
    filteredCrops = filteredCrops?.filter((crop) => crop?.finish_date);
  } else if (status === "todo") {
    filteredCrops = filteredCrops?.filter((crop) => !crop?.finish_date);
  }

  return (
    <Fragment>
      <h1>Cultivos</h1>
      {crops.length > 0 ? (
        <Fragment>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ my: 1, minWidth: 220 }}
          >
            <InputLabel>Filtrar por estado</InputLabel>

            <Select
              name="taskstatus"
              value={status}
              label="Filtrar por estado"
              onChange={(e) => {
                setStatus(e.target.value);
              }}
            >
              {options.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={filteredCrops}
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
                  theme.palette.mode === "light"
                    ? theme.palette.grey[50]
                    : null,
              }}
            />
          </Box>
        </Fragment>
      ) : (
        <h3> No se registran cultivos. </h3>
      )}
    </Fragment>
  );
};

const CropsLoader = () => {
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

export default CropsLoader;
