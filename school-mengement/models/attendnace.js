const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        date: {
            type: Date,
            default: Date.now,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;