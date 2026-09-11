const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
