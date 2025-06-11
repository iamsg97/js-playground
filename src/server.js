const express = require('express')
const path = require('node:path')

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')))

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`TODO App running on port ${PORT}`)
})
