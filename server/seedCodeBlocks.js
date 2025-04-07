const mongoose = require("mongoose");
const CodeBlock = require("./models/CodeBlockModel");

require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Delete existing code blocks (to avoid duplicates)
    await CodeBlock.deleteMany({});

    // Create 4 new code blocks
    const blocks = [
      {
        title: "Async Case",
        initialCode: "async function fetchData() {\n  // your code here\n}",
        solution:
          "async function fetchData() {\n  return await fetch('https://api.example.com');\n}",
      },
      {
        title: "Array Methods",
        initialCode: "const arr = [1, 2, 3];\n// your code here",
        solution: "const arr = [1, 2, 3];\narr.map(x => x * 2);",
      },
      {
        title: "Promise Chain",
        initialCode: "Promise.resolve(1)\n// your code here",
        solution: "Promise.resolve(1).then(x => x + 1).then(console.log);",
      },
      {
        title: "Arrow Function",
        initialCode: "// define arrow function\nconst add = ",
        solution: "const add = (a, b) => a + b;",
      },
    ];

    // Insert the new blocks into the database
    await CodeBlock.insertMany(blocks);
    console.log("Code blocks inserted");

    // Exit the script
    process.exit();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
