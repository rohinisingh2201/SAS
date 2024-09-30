const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const infoSchema = new Schema({
    gpNum: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    rollNum: {
        type: Number,
        required: true,
    },
    effort1: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort2: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort3: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort4: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort5: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort6: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort7: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort8: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort9: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort10: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort11: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    effort12: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

const Info = mongoose.model("Info", infoSchema);
module.exports = Info;