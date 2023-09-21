import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";

import GridViewIcon from "@mui/icons-material/GridView";

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

function SchedulerToolbar(props: any) {
  const { events, onSearchResult, switchMode, onModeChange, onDateChange } =
    props;

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
    if (newValue?.date) {
      newDate = parse(newValue.date, "yyyy-MM-dd", new Date());
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
        <Grid item xs sm md sx={{ textAlign: "right" }}>
          <Stack
            direction="row"
            sx={{
              pr: 0.5,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <StyledAutoComplete
              value={value}
              id="scheduler-autocomplete"
              inputValue={inputValue}
              sx={{ mb: 0, display: "inline-flex" }}
              onChange={handleOnChange}
              options={events?.sort(
                (a: any, b: any) => -b.groupLabel.localeCompare(a.groupLabel)
              )}
              groupBy={(option: any) => (option ? option?.groupLabel : null)}
              getOptionLabel={(option: any) =>
                option ? `${option.groupLabel || ""}` : ""
              }
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              onInputChange={(newInputValue: any) => {
                setInputValue(newInputValue);
                setSearchResult(newInputValue);
              }}
              renderOption={(props: any, option: any) => (
                <Box component="li" sx={{ fontSize: 12 }} {...props}>
                  {format(
                    parse(option?.date, "yyyy-MM-dd", new Date()),
                    "PPP",
                    {
                      locale: es,
                    }
                  )}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label={"Filtrar"}
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
          </Stack>
        </Grid>
      </Grid>
    </Toolbar>
  );
}

SchedulerToolbar.propTypes = {
  events: PropTypes.array.isRequired,
  switchMode: PropTypes.string.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onSearchResult: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
};

export default SchedulerToolbar;
