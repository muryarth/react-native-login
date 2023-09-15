import mongoose from "mongoose";
import "dotenv/config";

// Variáveis de conexão
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// console.log(`user: ${dbUser} => password: ${dbPassword}`);

const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.nhadmvp.mongodb.net/react-native-login?retryWrites=true&w=majority`;
console.log(connectionString);

// Conecta
const db = mongoose.connect(connectionString)
    .then(() => console.log("Conectado ao banco."))
    .catch((err) => console.log(err));

export default db;