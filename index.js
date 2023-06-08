const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    console.log(authorization);
    if (!authorization) {
      return res.status(401).send({ error: true, message: ' token nai unauthorized access' })
    }
    // bearer token
    const token = authorization.split(' ')[1]
    console.log(token);
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ error: true, message: 'didnot match unauthorized access' })
      }
      req.decoded = decoded
      next()
    })
  }




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v9m7cjb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to summer school!');
});
async function run() {
    try {
        // all collections
        const usersCollection = client.db("summerSchoolDB").collection("users");
        const classesCollection = client.db("summerSchoolDB").collection("classes");
        const selectedClassesCollection = client.db("summerSchoolDB").collection("selectedClasses");
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        // sign jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token })
          })
        // Save user email and role in DB
        app.put('/users', async (req, res) => {
            const user = req.body
            const email = user.email
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        // post selected class
        app.post("/selectedClass", async (req, res) => {
            const selectedClass = req.body;
            const result = await selectedClassesCollection.insertOne(selectedClass);
            res.send(result);

        })

        // get all classes by user email
        app.get("/allClasses", async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        })
        // get all classes by user email
        app.get("/classes", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await classesCollection.find(query).toArray();
            res.send(result);
        })

        // Add A Class
        app.post("/addClass", async (req, res) => {
            const classes = req.body;
            console.log(classes);
            const result = await classesCollection.insertOne(classes)
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, (req, res) => {
    console.log(`app is listening on port ${port}`);
});

