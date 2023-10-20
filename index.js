const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbUserName = process.env.DB_USER;
const dbPassWord = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${dbUserName}:${dbPassWord}@cluster0.bndsovl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('branShopDB').collection('users');
    const bikesCollection = client.db('branShopDB').collection('bikes');

    // Add product apis
    
    app.get('/bikes', async (req,res) => {
        const cursor = bikesCollection.find();
        const result = await cursor.toArray();
        res.send(result);

    })

    app.get('/bikes/:brandName', async (req, res) => {
        const brandName = req.params.brandName;
        const cursor = bikesCollection.find({ brandName: brandName });
    
        try {
            const result = await cursor.toArray();
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error while fetching products by brandName' });
        }
    });

    app.post('/bikes', async (req, res) => {
        const bike = req.body;
        const isExist = await bikesCollection.findOne({ productName: bike.productName})
        if(!isExist){
            const result = await bikesCollection.insertOne(bike);
            res.send(result);
        }else{
            res.status(400).send({ message: 'This Bike already exists.' });
        }
        
    })

    //user related apis

    app.get('/users', async (req, res) => {
        const cursor = usersCollection.find();
        const users = await cursor.toArray();
        res.send(users);

    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const result = await usersCollection.insertOne(user);
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



app.get("/", (req,res) => {
    res.send("Brand shop server running!")
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})