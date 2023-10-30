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

import {
  Schedule as ScheduleIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

function TimeLineModeView(props: any) {
  const { rows, onTaskClick } = props;

  const handleTaskClick = (event: any, task: any) => {
    event.preventDefault();
    event.stopPropagation();
    onTaskClick(task);
  };

  if (rows) {
    rows.sort((a: any, b: any) => {
      let eventADate = a.done_date || a.due_date;
      let eventBDate = b.done_date || b.due_date;
      const dateA = parse(eventADate, "yyyy-MM-dd", new Date());
      const dateB = parse(eventBDate, "yyyy-MM-dd", new Date());
      return dateA.getTime() - dateB.getTime();
    });

    return (
      <Timeline position="alternate">
        {rows.map((task: any, index: any) => {
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
                {task?.due_date &&
                  format(
                    parse(
                      task?.done_date || task?.due_date,
                      "yyyy-MM-dd",
                      new Date()
                    ),
                    "PPP",
                    {
                      locale: es,
                    }
                  )}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot
                  color="secondary"
                  sx={{ backgroundColor: task?.color }}
                >
                  {task.done_date ? <CheckIcon /> : <ScheduleIcon />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "12px", px: 2 }}>
                <Typography variant="body1" component="span">
                  {task?.name}
                </Typography>
                <Typography>
                  Parcela N° {task.landplot} - {task.species_name}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  } else return null;
}

export default TimeLineModeView;
