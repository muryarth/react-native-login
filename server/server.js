import "dotenv/config"; 
import chalk from "chalk";
import app from "./src/app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(chalk.blue(`Listening on http://localhost:${port}`))
});