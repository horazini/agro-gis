import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme, styled, alpha } from "@mui/material/styles";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  tableCellClasses,
  Box,
  Button,
  Grid,
  Hidden,
  IconButton,
  Menu,
  Toolbar,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";

import { es } from "date-fns/locale";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { format, add, sub, getDaysInMonth, isSameMonth } from "date-fns";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    borderTop: `1px ${theme.palette.divider} solid !important`,
    borderBottom: `1px ${theme.palette.divider} solid !important`,
    borderLeft: `1px ${theme.palette.divider} solid !important`,
    ["&:nth-of-type(1)"]: {
      borderLeft: `0px !important`,
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    height: 96,
    width: 64,
    maxWidth: 64,
    cursor: "pointer",
    verticalAlign: "top",
    borderLeft: `1px ${theme.palette.divider} solid`,
    ["&:nth-of-type(7n+1)"]: {
      borderLeft: 0,
    },
    ["&:nth-of-type(even)"]: {
      //backgroundColor: theme.palette.action.hover
    },
  },
  [`&.${tableCellClasses.body}:hover`]: {
    //backgroundColor: "#eee"
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  ["&:last-child td, &:last-child th"]: {
    border: 0,
  },
}));

function MonthModeView(props: any) {
  const {
    rows,
    options,
    columns,
    onTaskClick,
    onCellClick,
    onEventsChange,
    onDateChange,
  } = props;
  const theme = useTheme();
  const [state, setState] = useState<any>();
  const today = new Date();
  let currentDaySx = {
    width: 24,
    height: 22,
    margin: "auto",
    display: "block",
    paddingTop: "2px",
    borderRadius: "50%",
    //padding: "1px 7px",
    //width: 'fit-content'
  };

  const onCellDragOver = (e: any) => {
    e.preventDefault();
  };

  const onCellDragStart = (e: any, item: any, rowIndex: number) => {
    setState({
      ...state,
      itemTransfert: { item, rowIndex },
    });
  };

  const onCellDragEnter = (e: any, elementId: number, rowIndex: number) => {
    e.preventDefault();
    setState({
      ...state,
      transfertTarget: { elementId, rowIndex },
    });
  };

  const onCellDragEnd = (e: any) => {
    e.preventDefault();
    if (!state.itemTransfert && !state.transfertTarget) return;
    let transfert = state.itemTransfert;
    let transfertTarget = state.transfertTarget;
    let rowsCopy: any = Array.from(rows);
    let rowInd = rowsCopy.findIndex(
      (d: any) => d.id === transfertTarget.rowIndex
    );

    if (rowInd !== -1) {
      let dayInd = rowsCopy[rowInd]?.days?.findIndex(
        (d: any) => d.id === transfertTarget.elementId
      );
      if (dayInd !== -1) {
        let day = rowsCopy[rowInd]?.days[dayInd];
        let splittedDate = transfert?.item?.date?.split("-");
        if (!transfert?.item?.day) {
          // Get day of the date (DD)
          transfert.item.day = parseInt(splittedDate[2]);
        }
        if (transfert.item.day !== day?.day) {
          let itemCheck = day.data.findIndex(
            (item: any) =>
              item.day === transfert.item.day &&
              item.label === transfert.item.label
          );
          if (itemCheck === -1) {
            let prevDayEvents = rowsCopy[transfert.rowIndex].days.find(
              (d: any) => d.day === transfert.item.day
            );
            let itemIndexToRemove = prevDayEvents?.data?.findIndex(
              (i: any) => i.id === transfert.item.id
            );
            if (itemIndexToRemove === undefined || itemIndexToRemove === -1) {
              return;
            }
            prevDayEvents?.data?.splice(itemIndexToRemove, 1);
            transfert.item.day = day?.day;
            transfert.item.date = format(day?.date, "yyyy-MM-dd");
            day.data.push(transfert.item);
            setState({
              ...state,
              rows: rowsCopy,
              itemTransfert: null,
              transfertTarget: null,
            });
            onEventsChange && onEventsChange(transfert.item);
          }
        }
      }
    }
  };

  const handleCellClick = (event: any, row: any, day: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (day?.data?.length === 0 && onCellClick) {
      onCellClick(event, row, day);
    }
  };

  const renderTask = (tasks: any, rowId: number) => {
    return tasks?.map((task: any, index: any) => {
      return (
        <Paper
          sx={{
            width: "100%",
            py: 0,
            my: 0.3,
            color: "#fff",
            display: "inline-flex",
            backgroundColor: task?.color || theme.palette.primary.light,
          }}
          draggable
          onClick={(e) => handleTaskClick(e, task)}
          onDragStart={(e: any) => onCellDragStart(e, task, rowId)}
          elevation={0}
          key={`item-d-${task.id}-${rowId}`}
        >
          <Box sx={{ px: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 11 }}>
              {task.label}
            </Typography>
          </Box>
        </Paper>
      );
    });
  };

  const handleTaskClick = (event: any, task: any) => {
    event.preventDefault();
    event.stopPropagation();
    onTaskClick && onTaskClick(event, task);
  };

  const [anchorDateEl, setAnchorDateEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today || new Date());
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(selectedDate));

  const openDateSelector = Boolean(anchorDateEl);

  const handleChangeDate = (method: any) => {
    if (typeof method !== "function") {
      return;
    }
    let options: any = { months: 1 };
    let newDate = method(selectedDate, options);
    setDaysInMonth(getDaysInMonth(newDate));
    setSelectedDate(newDate);
  };

  const handleOpenDateSelector = (event: any) => {
    setAnchorDateEl(event.currentTarget);
  };

  const handleCloseDateSelector = () => {
    setAnchorDateEl(null);
  };

  useEffect(() => {
    onDateChange && onDateChange(daysInMonth, selectedDate);
  }, [daysInMonth, selectedDate]);

  return (
    <>
      <Toolbar
        variant="dense"
        sx={{
          px: "0px !important",
          display: "block",
          borderBottom: `1px ${theme.palette.divider} solid`,
        }}
      >
        <Grid container spacing={0} alignItems="center" justifyContent="center">
          <Grid item xs={1} sm md>
            <Typography
              component="div"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Hidden smDown>
                <IconButton
                  sx={{ ml: 0, mr: -0.1 }}
                  onClick={() => handleChangeDate(sub)}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Button
                  size="small"
                  id="basic-button"
                  aria-haspopup="true"
                  //endIcon={<TodayIcon />}
                  aria-controls="basic-menu"
                  onClick={handleOpenDateSelector}
                  sx={{ color: "text.primary" }}
                  aria-expanded={openDateSelector ? "true" : undefined}
                >
                  {format(selectedDate, "MMMM-yyyy", {
                    locale: es,
                  })}
                </Button>
                <IconButton
                  sx={{ ml: 0.2 }}
                  onClick={() => handleChangeDate(add)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Hidden>
              <Hidden smUp>
                <IconButton
                  sx={{ ml: 0, "aria-label": "menu" }}
                  size="small"
                  onClick={handleOpenDateSelector}
                >
                  <TodayIcon />
                </IconButton>
              </Hidden>
              <Menu
                id="date-menu"
                anchorEl={anchorDateEl}
                open={openDateSelector}
                onClose={handleCloseDateSelector}
                MenuListProps={{ "aria-labelledby": "basic-button" }}
              >
                <DateCalendar
                  //displayStaticWrapperAs="desktop"
                  showDaysOutsideCurrentMonth
                  value={dayjs(selectedDate)}
                  onChange={(newValue: any) => {
                    setDaysInMonth(getDaysInMonth(new Date(newValue)));
                    setSelectedDate(new Date(newValue));
                    handleCloseDateSelector();
                  }}
                  //renderInput={(params: any) => <TextField {...params} />}
                />
              </Menu>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>

      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table
          size="small"
          aria-label="simple table"
          stickyHeader
          sx={{ minWidth: options?.minWidth || 650 }}
        >
          <TableBody>
            {rows?.map((row: any, index: any) => (
              <StyledTableRow
                key={`row-${row.id}-${index}`}
                sx={{
                  "&:last-child th": {
                    border: 0,
                    borderLeft: `1px ${theme.palette.divider} solid`,
                    "&:firs-child": {
                      borderLeft: 0,
                    },
                  },
                }}
              >
                {row?.days?.map((day: any, indexD: any) => {
                  const currentDay =
                    day.day === today.getUTCDate() &&
                    isSameMonth(day.date, today);
                  return (
                    <StyledTableCell
                      scope="row"
                      align="center"
                      component="th"
                      sx={{ px: 0.5, position: "relative" }}
                      key={`day-${day.id}`}
                      onDragEnd={onCellDragEnd}
                      onDragOver={onCellDragOver}
                      onDragEnter={(e) => onCellDragEnter(e, day.id, row.id)}
                      onClick={(event) => handleCellClick(event, row, day)}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          overflowY: "visible",
                          color: day.outmonthday ? "lightgray" : "",
                        }}
                      >
                        {index === 0 &&
                          columns[indexD]?.headerName?.toUpperCase()}
                        .
                        <Typography
                          variant="body2"
                          sx={{
                            ...currentDaySx,
                            background: currentDay
                              ? alpha(theme.palette.primary.main, 1)
                              : "",
                            color: currentDay ? "#fff" : "",
                          }}
                        >
                          {day.day}
                        </Typography>
                        {day?.data?.length > 0 && renderTask(day?.data, row.id)}
                        {day.outmonthday && <div className="overlay" />}
                      </Box>
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

MonthModeView.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array,
  options: PropTypes.object,
  onDateChange: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func,
  onCellClick: PropTypes.func,
};

MonthModeView.defaultProps = {
  columns: [],
  rows: [],
};

export default MonthModeView;
