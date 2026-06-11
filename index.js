const express = require('express')
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.get('/', (req, res) => {
  res.send('Hello World!')
})




const uri = process.env.MONGODB_DB_URI;


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


    const database = client.db("talentist_db");
    const jobCollection = database.collection("jobs");
  const applicationsCollection = database.collection("applications");
 const planCollection = database.collection("plans");
const subscriptionCollection = database.collection("subscriptions");
const userCollection = database.collection("user")
const companyCollection = database.collection("companies")

    app.post('/api/jobs',async(req,res)=>{
     const job = req.body;
     const newJob ={
      ...job,
      createdAt: new Date()
     }
        const result = await jobCollection.insertOne(newJob);
        res.send(result);
    })

    //company related apis
    app.post('/api/companies',async(req,res)=>{
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date()
      };
         const result = await database.collection("companies").insertOne(newCompany);
         res.send(result);
     })

     app.get('/api/companies',async(req,res)=>{
      const cursor = companyCollection.find();
   const result = await cursor.toArray();
   res.send(result);
     })

     app.get('/api/jobs/:id',async(req,res)=>{   
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      console.log(query);
      const job = await jobCollection.findOne(query);
      res.json(job);
     })


     app.patch('api/companies/:id', async(req, res)=>{
      const id = req.params.id
      const updatedCompany = req.body;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc ={
        $set:{
          status:updatedCompany.status
        }
      }
      const result = await companyCollection.updateOne(filter,updatedDoc)
   res.send(result)
    })
   
     //application related apis


  app.get('/api/applications/applicant',async(req,res)=>{
    const query = {}; 
   if(req.query.applicantId){
    query.applicantId = req.query.applicantId;
   }
   if(req.query.jobId){
    query.jobId = req.query.jobId;
   }
   const cursor = applicationsCollection.find(query);
   const result = await cursor.toArray();
   res.send(result);
  
  })

   app.post('/api/applications',async(req,res)=>{
    const application = req.body; 
    const newApplication = {
      ...application,
      createdAt: new Date()   
   }
   const result = await applicationsCollection.insertOne(newApplication);
   res.send(result);
   })



    app.put('/api/companies/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedCompany = req.body;
        delete updatedCompany._id;
        const updateDoc = {
          $set: updatedCompany,
        };
        const result = await database.collection("companies").updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })

    app.get('/api/my/companies', async (req, res) => {
      
      try {
        const recruiterId = req.query.recruiterId;
        console.log(recruiterId);
        if (!recruiterId) {
          return res.status(400).json({ error: "recruiterId query parameter is required" });
        }
        const query = { recruiterId: recruiterId };
        const company = await database.collection("companies").findOne(query);
        res.json(company || 'company not found');
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })

  app.patch('/api/companies/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCompany = req.body;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: updatedCompany.status
                }
            }
            const result = await companyCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


   app.get('/api/jobs',async(req,res)=>{
    const query = {};
    if(req.query.companyId){
      query.companyId= req.query.companyId; 
    }
    if(req.query.status){
      query.status= req.query.status;
    }
    const cursor = jobCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
   })
//plans

app.get('/api/plans',async(req,res)=>{
  const query = {};
if(req.query.plan_id){
  query.id = req.query.plan_id;
}
const plan = await planCollection.findOne(query);
console.log(plan,'panpan');
res.send(plan);
})

//subscriptions
app.post('/api/subscriptions',async(req,res)=>{
  const data = req.body;
  const subInfo ={
  ...data,
  createdAt: new Date()
  }
  const result = await subscriptionCollection.insertOne(subInfo);
  // res.send(result);
//update the user plan information
  const filter ={email: data.email}
  //update the value of the 'quantity' field to 5
  const updateDocument ={
    $set: {
      plan: data.planId,

    },
  };
  const updateResult = await userCollection.updateOne(filter, updateDocument);
  res.send( updateResult);
  })




  //inefficeient way to join/aggregate collection
   app.get('/api/companies', async (req, res) => {
            const cursor = companyCollection.find();
            const companies = await cursor.toArray();

            for (const company of companies) {
                const filter = {
                    companyId: company._id.toString()
                }
                const jobCount = await jobCollection.countDocuments(filter)
                company.jobCount = jobCount
            }

            res.send(companies);
        })

  //inefficeient way to join/aggregate collection
   app.get('/api/companies2', async (req, res) => {
           const pipeline =[
            {
              $skip: 5
            }
           ]
           const cursor = companyCollection.aggregate(pipeline);
           const result = await cursor.toArray();
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











app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)

})