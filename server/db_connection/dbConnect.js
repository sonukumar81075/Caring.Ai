import mongoose from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.MONGODB_URI, {
            dbName: "caring_ai"
        })
        .then(() => {
            console.log("connected to database")
        }).catch((err) => {
            console.log(`something error occured while connectuing to databse:${err}`)
        })
}