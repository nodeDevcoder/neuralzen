const mongoose = require("mongoose");

let entrySchema = new mongoose.Schema({
    title: { type: String, required: true },
    journal: { type: String, required: false },
    board: { 
        id: { type: String, required: true }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Entry", entrySchema)