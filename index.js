const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Welcome to summer school!');
});


app.listen(port, (req, res) => {
    console.log(`app is listening on port ${port}`);
});

