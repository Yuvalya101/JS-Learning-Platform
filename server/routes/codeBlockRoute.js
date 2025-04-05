// server/routes/codeBlocks.js
const express = require("express");
const router = express.Router();
const CodeBlock = require("../models/CodeBlockModel");

// GET all code blocks
router.get("/", async (req, res) => {
  try {
    const blocks = await CodeBlock.find();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get a single code block by ID
router.get("/:id", async (req, res) => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: "Block not found" });
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch block" });
  }
});


module.exports = router;
