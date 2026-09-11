const { Inngest } = require("inngest");

const inngest = new Inngest({ id: "report-api" });

const sayHello = inngest.createFunction(
  { id: "say-hello" },
  { event: "test/hello" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");
    return "Hello from the background!";
  }
);

module.exports = { inngest, sayHello };
