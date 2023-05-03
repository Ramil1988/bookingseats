const { MongoClient } = require("mongodb");
const { flights, reservations } = require("./data");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function createCollections() {
  const client = new MongoClient(MONGO_URI, options);
  await client.connect();

  try {
    const db = client.db("slingair");
    const flightsCollection = db.collection("flights");
    const reservationsCollection = db.collection("reservations");

    await flightsCollection.insertMany(
      Object.entries(flights).map(([flight, seats]) => ({ flight, seats }))
    );
    await reservationsCollection.insertMany(reservations);

    console.log("Collections created successfully");
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}

createCollections();
