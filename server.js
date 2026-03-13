const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, ".")));

const dataPath = path.join(__dirname, "data.json");

function readData() {
  if (!fs.existsSync(dataPath)) return [];
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

app.post("/save-school", (req, res) => {
  const { schoolName } = req.body;
  if (!schoolName)
    return res.status(400).send({ error: "School name is required" });

  let data = readData();
  // Use findIndex to update if exists, or push new
  const index = data.findIndex((item) => item.schoolName === schoolName);
  const entry = {
    schoolName,
    timestamp: new Date().toISOString(),
    progress: {},
  };

  if (index !== -1) {
    data[index].timestamp = entry.timestamp;
  } else {
    data.push(entry);
  }

  writeData(data);
  res.send({ success: true });
});

app.post("/save-progress", (req, res) => {
  const progressData = req.body;
  const { schoolName } = progressData;
  if (!schoolName)
    return res.status(400).send({ error: "School name is required" });

  let data = readData();
  const index = data.findIndex((item) => item.schoolName === schoolName);

  if (index !== -1) {
    data[index] = {
      ...data[index],
      ...progressData,
      timestamp: new Date().toISOString(),
    };
  } else {
    data.push({
      ...progressData,
      timestamp: new Date().toISOString(),
    });
  }

  writeData(data);
  res.send({ success: true });
  });

  app.get('/load-progress/:schoolName', (req, res) => {
  const { schoolName } = req.params;
  const data = readData();
  const entry = data.find(item => item.schoolName === schoolName);

  if (entry) {
      res.send(entry);
  } else {
      res.status(404).send({ error: 'Progress not found' });
  }
  });

  app.listen(PORT, () => {  console.log(`Server running at http://localhost:${PORT}`);
});
