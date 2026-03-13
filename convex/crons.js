import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Monthly reset check for all users
// This would ideally run daily and check which users need a reset today
// But for now, let's keep it simple.
// Note: Convex crons are set in the dashboard usually, but this is the code version.
crons.daily(
  "check monthly resets",
  { hourUTC: 0, minuteUTC: 0 },
  api.credits.checkAndResetAllUsers
);

export default crons;
