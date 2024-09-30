const mongoose = require("mongoose");
const initData = require("./data.js");
const Info = require("../models/info.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/student"

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    })


async function main() {
    await mongoose.connect(MONGO_URL);
} 

const initDB = async () => {
    await Info.deleteMany({});
    await Info.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();