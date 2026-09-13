import express from "express"
import authRoutes from "./routes/auth_routes.js"
import categoryRouter from './routes/category_routes.js';
import authorRouter from './routes/author_routes.js';
import bookRouter from './routes/book_routes.js';



const app = express()


app.use(express.json())

app.get("/api", (req, res) => {
    res.json({ message: "API bibliothèque opérationnelle" })
})

app.use("/api/auth", authRoutes)
app.use('/api/categories', categoryRouter)
app.use('/api/auteurs', authorRouter)
app.use('/api/livres', bookRouter)

app.use((req, res) => {
    res.status(404).json({
        message: 'Route introuvable'
    })
})

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        message: error.message || 'Erreur interne du serveur'
    })
})


app.listen(process.env.PORT, () => {
    console.log(`Le server écoute sur le port ${process.env.PORT}`)
})