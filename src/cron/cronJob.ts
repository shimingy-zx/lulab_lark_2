// // cronJob.ts
// import cron from "node-cron";
// import { sync } from "/playground/user_sync";

// export const startCronJob = () => {
//   console.log("This task runs every 10 seconds");
//   let cronJob = cron.schedule("0 0 */5 * * *", async () => {
//     await sync("abc", "123");
//   });

//   return cronJob;
// };


