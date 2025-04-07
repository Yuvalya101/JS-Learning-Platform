const express = require("express");
const router = express.Router();
const CodeBlock = require("../models/CodeBlockModel");

router.get("/seed", async (req, res) => {
    try {
    await CodeBlock.deleteMany({});

    const blocks = [
      {
        title: "Async Case",
        initialCode: "async function fetchData() {\n  // your code here\n}",
        solution: "async function fetchData() {\n  return await fetch('https://api.example.com');\n}"
      },
      {
        title: "Array Methods",
        initialCode: "const arr = [1, 2, 3];\n// your code here",
        solution: "const arr = [1, 2, 3];\narr.map(x => x * 2);"
      },
      {
        title: "Promise Chain",
        initialCode: "Promise.resolve(1)\n// your code here",
        solution: "Promise.resolve(1).then(x => x + 1).then(console.log);"
      },
      {
        title: "Arrow Function",
        initialCode: "// define arrow function\nconst add = ",
        solution: "const add = (a, b) => a + b;"
      }
    ];

    await CodeBlock.insertMany(blocks);
    res.status(200).send("Code blocks inserted successfully");
  } catch (err) {
    console.error("Seed failed:", err);
    res.status(500).send("Seed failed");
  }
});

module.exports = router;
