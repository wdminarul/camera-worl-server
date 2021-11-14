const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

// user: camera
// pass:VquE0M1YHmeea1WU

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dlkzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.connect(err => {
    const products = client.db("camera").collection("item");
    const clientOrder = client.db("user").collection("order");
    const order = client.db("order").collection("list");
    const review = client.db("client").collection("review");
    const registerUsers = client.db("buyer").collection("info");

    app.get("/", (req, res) => {
        res.send("Hello World!");
      });
    
      app.post('/pro',(req,res)=>{
        products.insertOne(req.body).then((result)=>{
          res.send(result)
          console.log(result)
        })
      })
      app.post('/addOrders',(req,res)=>{
        clientOrder.insertOne(req.body).then((result)=>{
          res.send(result)
          console.log(result)
        })
      })

      app.post('/addReview',(req,res)=>{
        review.insertOne(req.body).then((result)=>{
          res.send(result)
          // console.log(result)
        })
      })

      // usersCollection
      app.post('/users',(req,res)=>{
        registerUsers.insertOne(req.body).then((result)=>{
          res.send(result)
          console.log(result)
        })
      })
      // user email set ot database 
      app.put('/users',(req,res)=>{
        const user = req.body;
        const filter = {email : user.email};
        const options = { upsert: true };
        const updateDoc = {$set : user};
        const result = registerUsers.updateOne(filter,updateDoc,options)
        res.json(result)

      })

      // query admin 
      app.put('/users/admin',(req,res)=>{
        const user = req.body;
        console.log('put', user)
        const filter = {email: user.email};
        const updateDoc={$set: {role: 'admin'}};
        const result= registerUsers.updateOne(filter,updateDoc);
        res.json(result)
      })

      app.get('/users/:email',async (req,res)=>{
        const email = req.params.email;
        const query = {email : email};
        const user = await registerUsers.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true
        }
        res.json({admin: isAdmin})
      })

      // cancel products 
      app.delete('/cancelOrder/:id', async(req,res)=>{
        console.log(req.params.id)
        const result = await clientOrder.deleteOne({_id: ObjectId(req.params.id)});
        // console.log(result);
        res.send(result)
      })

      app.get('/allOrders', async (req,res)=>{
        const result = await clientOrder.find({}).toArray();
        console.log(result)
        // console.log(req.params.email);
        
        res.json(result)
      })


      app.get('/myOrder/:email', async (req,res)=>{
        const result = await clientOrder.find({email: req.params.email}).toArray();
        console.log(result)
        // console.log(req.params.email);
        
        res.json(result)
      })

      app.get('/products', async(req,res)=>{
        const result = await products.find({}).limit(6).toArray()
        res.send(result)
      })    
      app.get('/allProducts', async(req,res)=>{
        const result = await products.find({}).toArray()
        res.send(result)
      })    

      app.get('/review', async(req,res)=>{
        const result = await review.find({}).toArray()
        res.send(result)
      })    

      app.post('/addOrder' , (req,res)=>{
        order.insertOne(req.body).then((result)=>{
          res.send(result)
          console.log(result)
        })
      })

  });






app.listen(port,req=>{
    console.log('listening to port ', port)
    })
