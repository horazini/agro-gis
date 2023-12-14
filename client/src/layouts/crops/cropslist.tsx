import {
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormatListBulleted } from "@mui/icons-material";

import {
  getTenantCrops,
  getTenantGeo,
  getTenantSpecies,
  speciesMainData,
} from "../../utils/services";
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

const CropsList = (
  crops: any[],
  landplots: { features: any[]; type: string },
  species: speciesMainData[]
) => {
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
          {params.value}
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
    { label: "En curso", value: "todo" },
    { label: "Terminados", value: "done" },
  ];

  const [filterOptions, setFilterOptions] = useState({
    status: "any",
    landplotId: 0,
    speciesId: 0,
  });

  let filteredCrops = crops;
  if (filterOptions.status === "done") {
    filteredCrops = filteredCrops?.filter((crop) => crop?.finish_date);
  } else if (filterOptions.status === "todo") {
    filteredCrops = filteredCrops?.filter((crop) => !crop?.finish_date);
  }
  if (filterOptions.landplotId !== 0) {
    filteredCrops = filteredCrops?.filter(
      (crop) => crop?.landplot_id === filterOptions.landplotId
    );
  }
  if (filterOptions.speciesId !== 0) {
    filteredCrops = filteredCrops?.filter(
      (crop) => crop?.species_id === filterOptions.speciesId
    );
  }

  return (
    <Fragment>
      <h1>Cultivos</h1>
      {crops.length > 0 ? (
        <Fragment>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControl
              variant="outlined"
              size="small"
              sx={{ my: 1, minWidth: 220 }}
            >
              <InputLabel>Filtrar por estado</InputLabel>

              <Select
                name="taskstatus"
                value={filterOptions.status}
                label="Filtrar por estado"
                onChange={(e) =>
                  setFilterOptions((prevOptions) => ({
                    ...prevOptions,
                    status: e.target.value,
                  }))
                }
              >
                {options.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
                {landplots ? (
                  <Autocomplete
                    size="small"
                    sx={{ my: 1, minWidth: 220 }}
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
                          feature.properties.landplot.id ===
                          filterOptions.landplotId
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setFilterOptions((prevOptions) => ({
                        ...prevOptions,
                        landplotId: newValue?.properties.landplot.id || 0,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Parcela" />
                    )}
                  />
                ) : null}
              </FormControl>
              <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
                {species ? (
                  <Autocomplete
                    size="small"
                    sx={{ my: 1, minWidth: 220 }}
                    id="species-autocomplete"
                    options={species}
                    getOptionLabel={(option: any) => option.name}
                    value={
                      species.find(
                        (specie: any) => specie.id === filterOptions.speciesId
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setFilterOptions((prevOptions) => ({
                        ...prevOptions,
                        speciesId: newValue?.id || 0,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Especie" />
                    )}
                  />
                ) : null}
              </FormControl>
            </Box>
          </Box>

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
  const [landplots, setLandplots] = useState<any>();
  const [species, setSpecies] = useState<speciesMainData[]>([]);

  const loadCrops = async (id: number) => {
    try {
      const data = await getTenantCrops(id);
      setCrops(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadLandplots = async (id: number) => {
    try {
      const data = await getTenantGeo(id);
      setLandplots(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSpecies = async (id: number) => {
    try {
      const data = await getTenantSpecies(id);
      setSpecies(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadCrops(tenantId);
      loadLandplots(tenantId);
      loadSpecies(tenantId);
    }
  }, [tenantId]);

  return <Fragment>{CropsList(crops, landplots, species)}</Fragment>;
};

export default CropsLoader;
