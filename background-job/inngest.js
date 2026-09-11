const { Inngest } = require("inngest");
const { reports } = require("./store");

const inngest = new Inngest({ id: "report-api" });

const sayHello = inngest.createFunction(
  { id: "say-hello" },
  { event: "test/hello" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");
    return "Hello from the background!";
  }
);

const makeReport = inngest.createFunction(
  { id: "make-report", retries: 2 },
  { event: "report/requested" },
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

module.exports = { inngest, sayHello, makeReport };
