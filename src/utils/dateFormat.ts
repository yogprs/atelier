import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatDate = (date: string, isTodayTime: boolean) => {
  const d = dayjs(date);

  if (isTodayTime && d.isToday()) {
    return formatTime(date);
  } else if (!isTodayTime && d.isToday()) {
    return "TODAY";
  }

  if (d.isYesterday()) {
    return "YESTERDAY";
  }

  return d.format("dddd, MMMM D").toUpperCase();
};

export const formatTime = (date: string) => {
  return dayjs(date).format("hh:mm A");
};
