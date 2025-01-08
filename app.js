const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const DATA_FILE = "data.txt";

// Initialize data file if not present
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({
      accessCode: { beginner: "", intermediate: "", advance: "" },
      beginner: { stage1: [], stage2: [], stage3: [] },
      intermediate: { stage1: [], stage2: [], stage3: [] },
      advanced: { stage1: [], stage2: [] },
    }, null, 2)
  );
}

// Helper function to read and write data
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeData = (data) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Get all data
app.get("/api/data", (req, res) => {
  const data = readData();
  res.json(data);
});


app.get("/api/data/:level/:stage", (req, res) => {
  const {level, stage} = req.params
  const data = readData();

  res.json({data:data[level][stage]});
});

// Update accessCode
app.put("/api/accessCode", (req, res) => {
  const { level, value } = req.body;
  if (!["beginner", "intermediate", "advance"].includes(level)) {
    return res.status(400).json({ error: "Invalid accessCode level." });
  }
  const data = readData();
  data.accessCode[level] = value;
  writeData(data);
  res.json({ message: "Access code updated successfully", data });
});

// CRUD for stages
app.post("/api/:level/:stage", (req, res) => {
  const { level, stage } = req.params;
  const { item } = req.body;
  const data = readData();

  if (!data[level] || !data[level][stage]) {
    return res.status(400).json({ error: "Invalid level or stage." });
  }

  data[level][stage].push(item);
  writeData(data);
  res.json({ message: "Item added to stage.", data });
});

app.delete("/api/:level/:stage/:index", (req, res) => {
  const { level, stage, index } = req.params;
  const data = readData();

  if (!data[level] || !data[level][stage]) {
    return res.status(400).json({ error: "Invalid level or stage." });
  }

  if (index < 0 || index >= data[level][stage].length) {
    return res.status(400).json({ error: "Invalid index." });
  }

  data[level][stage].splice(index, 1);
  writeData(data);
  res.json({ message: "Item removed from stage.", data });
});

app.put("/api/:level/:stage/:index", (req, res) => {
  const { level, stage, index } = req.params;
  const { item } = req.body;
  const data = readData();

  if (!data[level] || !data[level][stage]) {
    return res.status(400).json({ error: "Invalid level or stage." });
  }

  if (index < 0 || index >= data[level][stage].length) {
    return res.status(400).json({ error: "Invalid index." });
  }

  data[level][stage][index] = item;
  writeData(data);
  res.json({ message: "Item updated in stage.", data });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
