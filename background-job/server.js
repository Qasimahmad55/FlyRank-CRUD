const express = require('express');

const { serve } = require("inngest/express");
const { inngest, sayHello } = require("./inngest");

const app = express();
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
