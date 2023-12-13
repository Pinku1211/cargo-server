const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8pib.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const productCollection = client.db('carGoBrandDB').collection('products');
    const cartCollection = client.db('carGoBrandDB').collection('cart');

    app.get('/products', async(req, res)=>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    
    app.get('/products/:brand/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productCollection.findOne(query);
        res.send(result);
    })

    app.get('/products/:brand', async(req, res)=>{
        const brand = req.params.brand;
        const query = {brand: brand};
        const cursor = productCollection.find(query)
        const result = await cursor.toArray();
        res.send(result)
    })

    app.post('/products', async(req, res)=>{
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct)
        res.send(result)
    })

    app.put('/products/:brand/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updatedProduct = req.body;
        const product = {
            $set: {
                photo: updatedProduct.photo,
                name: updatedProduct.name,
                brand: updatedProduct.brand,
                type: updatedProduct.type,
                price: updatedProduct.price,
                rating: updatedProduct.rating
            }
        }
        const result = await productCollection.updateOne(filter, product, options);
        res.send(result)
    })


    // cart related api's------------------------

    app.get('/cart', async(req, res)=>{
        const cursor = cartCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/cart/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: id};
        const result = await cartCollection.findOne(query);
        res.send(result);
    })

    app.post('/cart', async(req, res)=>{
        const product = req.body;
        const result = await cartCollection.insertOne(product)
        res.send(result)
    })


    app.delete('/cart/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: id};
        const result = await cartCollection.deleteOne(query)
        res.send(result)
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


app.get('/', (req, res)=>{
    res.send('cargo server is running');
})


app.listen(port, ()=>{
    console.log(`server is running on port: ${port}`)
})
