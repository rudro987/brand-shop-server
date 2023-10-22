const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const brandNameCollection = client.db("branShopDB").collection('brands');
    const usersCollection = client.db("branShopDB").collection("users");
    const bikesCollection = client.db("branShopDB").collection("bikes");
    const cartItemsCollection = client.db("branShopDB").collection("cartItems");


     // Add and display brand apis

    app.get("/addBrands", async (req, res) => {
      const cursor = brandNameCollection.find();
      try {
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    })

    app.post('/addBrands', async (req, res) => {
      const brands = req.body;
      try {
        const result = await brandNameCollection.insertOne(brands);
        res.send(result);
      } catch (error) {
        res.status(400).send(error.message);
      }
    })

    // Add and display product apis

    app.get("/bikes", async (req, res) => {
      const cursor = bikesCollection.find();
      try {
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.get("/bikes/:brandName", async (req, res) => {
      const brandName = req.params.brandName;
      const cursor = bikesCollection.find({ brandName: brandName });

      try {
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.get("/bikes/:brandName/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };

      try {
        const result = await bikesCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.post("/bikes", async (req, res) => {
      const bike = req.body;
      try {
        const isExist = await bikesCollection.findOne({
          productName: bike.productName,
        });
        if (!isExist) {
          const result = await bikesCollection.insertOne(bike);
          res.send(result);
        } else {
          res.status(400).send(error.message);
        }
      } catch (error) {
        res.send(error.message);
      }
    });


    // Add to cart and my cart apis

    app.get("/my-cart", async (req, res) => {
      const cursor = cartItemsCollection.find();
      try {
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    app.get("/my-cart/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        try {
          const result = await cartItemsCollection.findOne(query);
          res.send(result);
        } catch (error) {
          res.status(500).send(error.message);
        }
      });

    app.post("/my-cart", async (req, res) => {
      const cart = req.body;
      try {
        const result = await cartItemsCollection.insertOne(cart);
        res.send(result);
      } catch (error) {
        res.status(400).send(error.message);
      }
    });

    // update product apis

    app.get("/updateProducts/:id", async (req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        try {
            const result = await bikesCollection.findOne(query);
            res.send(result);
        } catch (error) {
            res.send(error.message);
        }

    })

    app.put('/updateProducts/:id', async (req,res) => {
        try {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    productName: updatedProduct.productName,
                    brandName: updatedProduct.brandName,
                    image: updatedProduct.image,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    description: updatedProduct.description,
                    rating: updatedProduct.rating
                    
                }
            }
            const result = await bikesCollection.updateOne(filter, product, options);
            res.send(result);
        }
         catch (error) {
            res.send(error.message)
        }
    })

    //user related apis

    app.get("/users", async (req, res) => {
      try {
        const cursor = usersCollection.find();
        const users = await cursor.toArray();
        res.send(users);
      } catch (error) {
        res.send(error.message);
      }
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      try {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    // delete api

    app.delete("/my-cart/:id", async (req, res) => {
        const id= req.params.id;
        const query = {_id: new ObjectId(id)};
        try {
            const result = await cartItemsCollection.deleteOne(query);
            res.send(result);
        } catch (error) {
            res.send(error.message);
        }
  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brand shop server running!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
