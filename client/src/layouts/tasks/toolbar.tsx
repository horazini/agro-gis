import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  Toolbar,
  IconButton,
  ToggleButton,
  Hidden,
  ToggleButtonGroup,
  Grid,
  Stack,
  TextField,
  Autocomplete,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";

import GridViewIcon from "@mui/icons-material/GridView";
import { TaskType } from "./taskcalendar";

const StyledAutoComplete = styled(Autocomplete)(({ theme }) => ({
  color: "inherit",
  width: "94%",
  display: "inline-flex",
  margin: theme.spacing(0.5, 1.5),
  transition: theme.transitions.create("width"),
  [theme.breakpoints.up("sm")]: {
    width: "100%",
  },
  [theme.breakpoints.up("md")]: {
    width: "27ch",
  },
  [theme.breakpoints.up("lg")]: {
    width: "27ch",
  },
}));

export type SchedulerToolbarProps = {
  events: TaskType[];
  onSearchResult: any;
  switchMode: any;
  onModeChange: any;
  onDateChange: any;
  taskStatus: any;
  setTaskStatus: any;
};

function SchedulerToolbar(props: SchedulerToolbarProps) {
  const {
    events,
    onSearchResult,
    switchMode,
    onModeChange,
    onDateChange,
    taskStatus,
    setTaskStatus,
  } = props;

  const theme = useTheme();

  // Searchbar

  const [searchResult, setSearchResult] = useState<any>();

  useEffect(() => {
    onSearchResult && onSearchResult(searchResult);
  }, [searchResult]);

  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    onDateChange && onDateChange(selectedDate);
  }, [selectedDate]);

  const handleOnChange = (event: any, newValue: any) => {
    setValue(newValue);
    setSearchResult(newValue);

    let newDate = new Date();

    let eventDate = newValue?.done_date || newValue?.due_date;
    if (eventDate) {
      newDate = parse(eventDate, "yyyy-MM-dd", new Date());
    }

    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  // Mode selector

  const [mode, setMode] = useState(switchMode);

  useEffect(() => {
    if (switchMode !== mode) {
      setMode(switchMode);
    }
  }, [switchMode]);

  useEffect(() => {
    onModeChange(mode);
  }, [mode]);

  // Status selector

  const options = [
    { label: "No filtrar", value: "any" },
    { label: "Pendientes", value: "todo" },
    { label: "Realizados", value: "done" },
  ];

  const [status, setStatus] = useState(taskStatus);

  useEffect(() => {
    if (taskStatus !== status) {
      setStatus(taskStatus);
    }
  }, [taskStatus]);

  useEffect(() => {
    setTaskStatus(status);
  }, [status]);

  let filteredEvents = events;
  if (taskStatus === "done") {
    filteredEvents = filteredEvents?.filter(
      (event: TaskType) => event?.done_date
    );
  } else if (taskStatus === "todo") {
    filteredEvents = filteredEvents?.filter(
      (event: TaskType) => !event?.done_date
    );
  }

  return (
    <Toolbar
      variant="dense"
      sx={{
        px: "0px !important",
        display: "block",
        borderBottom: `1px ${theme.palette.divider} solid`,
      }}
    >
      <Grid container spacing={0} alignItems="center" justifyContent="flex-end">
        <Grid item xs sm md>
          <Stack
            direction="row"
            sx={{
              pr: 0.5,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <FormControl
              variant="outlined"
              size="small"
              sx={{ m: 1, minWidth: 220 }}
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

            <Box>
              <StyledAutoComplete
                value={value}
                componentsProps={{
                  popper: { style: { width: "fit-content" } },
                }}
                id="scheduler-autocomplete"
                inputValue={inputValue}
                sx={{ mb: 0, display: "inline-flex" }}
                onChange={handleOnChange}
                options={filteredEvents?.sort(
                  (a: any, b: any) => b.crop_id - a.crop_id
                )}
                groupBy={(option: any) =>
                  option
                    ? `Parcela N° ${option.landplot} - ${option.species_name}`
                    : ""
                }
                getOptionLabel={(option: any) =>
                  option
                    ? `Parcela N° ${option.landplot} - ${option.species_name}`
                    : ""
                }
                isOptionEqualToValue={(option: any, value: any) =>
                  value === "" || option.id === value.id
                }
                onInputChange={(event, newInputValue: any) => {
                  setInputValue(newInputValue);
                  setSearchResult(newInputValue);
                }}
                renderOption={(props: any, option: any) => {
                  let eventDate = option.done_date || option.due_date;
                  return (
                    <Box
                      component="li"
                      sx={{ fontSize: 12 }}
                      {...props}
                      key={option.id}
                    >
                      {format(
                        parse(eventDate, "yyyy-MM-dd", new Date()),
                        "PPP",
                        {
                          locale: es,
                        }
                      )}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label={"Filtrar por cultivo"}
                    InputProps={{ ...params.InputProps }}
                  />
                )}
              />

              <Hidden mdUp>
                <IconButton
                  sx={{ mr: 0, "aria-label": "menu" }}
                  size="small"
                  //onClick={handleOpenXSelector}
                >
                  <GridViewIcon />
                </IconButton>
              </Hidden>
              <Hidden mdDown>
                <ToggleButtonGroup
                  exclusive
                  value={mode}
                  size="small"
                  color="primary"
                  aria-label="text button group"
                  sx={{ mt: 0.2, mr: 1.3, display: "contents" }}
                  onChange={(e, newMode) => {
                    if (newMode) {
                      setMode(newMode);
                    }
                  }}
                >
                  {[
                    { label: "calendario", value: "month" },
                    { label: "linea cronológica", value: "timeline" },
                  ].map((tb) => (
                    <ToggleButton
                      sx={{ mt: 0.5 }}
                      key={tb.value}
                      value={tb.value}
                    >
                      {tb.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Hidden>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Toolbar>
  );
}

export default SchedulerToolbar;
