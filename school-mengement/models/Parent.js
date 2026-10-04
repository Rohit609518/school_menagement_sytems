const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            unique: true,
            sparse: true
        },

        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            sparse: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        }
    },
    { timestamps: true }
);

const Parent = mongoose.model("Parent", parentSchema);

module.exports = Parent;