const express = require('express');
const { serve } = require("inngest/express");
const { inngest, sayHello, makeReport } = require("./inngest");
const { reports } = require("./store");
const crypto = require("crypto");

const app = express();
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello, makeReport] }));

app.post('/reports', async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: "Missing topic" });
    }
    const id = crypto.randomUUID();
    reports[id] = { id, topic, status: "pending" };
    
    await inngest.send({
        name: "report/requested",
        data: { id, topic }
    });
    
    res.status(202).json({ id, topic, status: "pending" });
});

app.get('/reports/:id', (req, res) => {
    const report = reports[req.params.id];
    if (!report) {
        return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
