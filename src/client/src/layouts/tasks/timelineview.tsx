import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import {
  TimelineDot,
  TimelineOppositeContent,
  TimelineContent,
  TimelineSeparator,
  TimelineConnector,
  Timeline,
  TimelineItem,
} from "@mui/lab";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

function TimeLineModeView(props: any) {
  const { options, rows, searchResult, onTaskClick } = props;

  const handleTaskClick = (event: any, task: any) => {
    event.preventDefault();
    event.stopPropagation();
    onTaskClick && onTaskClick(event, task);
  };

  let fileredEvents = rows;
  if (searchResult) {
    fileredEvents = fileredEvents?.filter(
      (event: any) => event?.groupLabel === searchResult?.groupLabel
    );
  }

  fileredEvents.sort((a: any, b: any) => {
    const dateA = parse(a.date, "yyyy-MM-dd", new Date());
    const dateB = parse(b.date, "yyyy-MM-dd", new Date());
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Typography
      sx={{
        overflowY: "auto",
        height: options?.height || 540,
        maxHeight: options?.maxHeight || 540,
      }}
    >
      <Timeline position="alternate">
        {fileredEvents?.map((task: any, index: any) => {
          return (
            <TimelineItem
              key={`timeline-${index}`}
              sx={{ cursor: "pointer" }}
              onClick={(event) => handleTaskClick(event, task)}
            >
              <TimelineOppositeContent
                sx={{ m: "auto 0" }}
                align="right"
                variant="body2"
                color="text.secondary"
              >
                {task?.date &&
                  format(parse(task?.date, "yyyy-MM-dd", new Date()), "PPP", {
                    locale: es,
                  })}
                <br />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot
                  color="secondary"
                  sx={{ backgroundColor: task?.color }}
                >
                  {task?.icon || <ScheduleIcon />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "12px", px: 2 }}>
                <Typography variant="body1" component="span">
                  {task?.label}
                </Typography>
                <Typography>{task?.groupLabel}</Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Typography>
  );
}

TimeLineModeView.propTypes = {
  rows: PropTypes.array,
  options: PropTypes.object,
  searchResult: PropTypes.object,
  onTaskClick: PropTypes.func.isRequired,
};

TimeLineModeView.defaultProps = {};

export default TimeLineModeView;
