import app from "./app.js";
import {config} from "dotenv"

config();
console.log(process.env.DATABASE_URL)

function main() {
  try {
    app.listen(process.env.PORT);
    console.log("Server on Port", process.env.PORT);
  } catch (error) {
    console.log(error);
  }
}

main();
