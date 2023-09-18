import express from "express";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import db from "./config/connection.js";
import jwt from "jsonwebtoken";

const app = express();

// Express lendo JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: "Bem-vindo a nossa API" });
});

// Rota privada
app.get("/users/:id", checkToken, async (req, res) => {
    const id = req.params.id;

    // Verifica se o usuário existe
    const user = await User.findById(id, '-password');

    if (!user) {
        res.status(404).send({ message: "Usuário não encontrado" });
    }
    else {
        res.status(200).json({ user });
        //resposta
    }

});

// Middleware que verifica o token
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acesso negado!" });
    }

    try {

        const secret = process.env.SECRET;

        jwt.verify(token, secret); // Caso o token não seja válido, gera um erro e cai no catch

        next();
    }
    catch (error) {
        res.status(400).json({ message: "Token inválido!" });
    }
}

// Registro
app.post('/auth/register', async (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;

    console.log(req.body);

    // Validação do nome
    if (!name) {
        return res.status(422).json({ message: "O nome é obrigatório" });
    }

    // Validação do email
    if (!email) {
        return res.status(422).json({ message: "O email é obrigatório" });
    }

    // Validação da senha
    if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória" });
    }

    // Validação da confirmação da senha
    if (!passwordConfirmation) {
        return res.status(422).json({ message: "Você deve confirmar a senha informada" });
    }

    // Verifica se o usuário já existe no banco
    const userExists = await User.findOne({ email: email });

    if (userExists) {
        return res.status(422).json({ message: "Este e-mail já está sendo utilizado!" });
    }

    // Create password

    // Salt adiciona complexidade na senha

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Verifica se a senha é igual
    if (password !== passwordConfirmation) {
        return res.status(422).json({ message: "As senhas não conferem!" });
    }

    // Create user

    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {

        await user.save();

        res.status(201).json({ message: "Usuário criado com sucesso!" });

    } catch (error) {
        res.status(500).json({ msg: "Ocorreu um erro no servidor. Tente novamente mais tarde!" });
    }
});

// Login
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    // Validação do nome
    if (!email) {
        return res.status(422).json({ message: "O email é obrigatório" });
    }

    // Verifica se o usuário existe
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(422).json({ message: "Usuário não encontrado!" });
    }

    // Validação do campo da senha
    if (!password) {
        return res.status(422).json({ message: "A senha é obrigatória" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        res.status(422).send({ message: "Senha inválida!" });
    }
    else {
        try {
            const secret = process.env.SECRET;

            const token = jwt.sign(
                {
                    id: user._id
                },
                secret,
            );

            res.status(200).json({ message: "Autenticação realizada com sucesso", token })

        } catch (err) {
            console.log(err);

            res.status(500).json({
                msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!',
            })
        }
    }

});

export default app;