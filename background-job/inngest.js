const { Inngest } = require("inngest");
const { reports } = require("./store");

const inngest = new Inngest({ id: "report-api", isDev: true });

const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");
    return "Hello from the background!";
  }
);

const makeReport = inngest.createFunction(
  { id: "make-report", retries: 2, triggers: [{ event: "report/requested" }] },
  async ({ event, step }) => {
    const { id, topic } = event.data;
    await step.sleep("do-the-slow-work", "8s");
    const result = await step.run("build-report", async () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }
      reports[id] = { id, topic, status: "done" };
      return `Report for ${topic} is ready!`;
    });
    return result;
  }
);

const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    await step.run("log-summary", async () => {
      let pending = 0, done = 0, failed = 0;
      for (const report of Object.values(reports)) {
        if (report.status === "pending") pending++;
        if (report.status === "done") done++;
        if (report.status === "failed") failed++;
      }
      console.log(`Heartbeat: ${pending} pending, ${done} done, ${failed} failed`);
    });
  }
);

module.exports = { inngest, sayHello, makeReport, heartbeat };
