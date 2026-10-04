const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            sparse: true
        },
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: String,
            required: true
        },

        subject: {
            type: String,
            required: true
        },

        experience: {
            type: Number,
            required: true
        },

        salary: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;