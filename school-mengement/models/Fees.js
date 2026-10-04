const mongoose = require("mongoose");

const FeesSchama = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paidAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Bank Transfer"],
            required: true
        },
        status: {
            type: String,
            enum: ["paid", "partial", "pending"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Fees = mongoose.model("Fees", FeesSchama);

module.exports = Fees;