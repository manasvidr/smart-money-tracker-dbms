import { MongoClient } from "mongodb";

// One shared Mongo client; returns the raw_sec_filings collection.
const g = globalThis;
const client =
  g._mongoClient || (g._mongoClient = new MongoClient(process.env.MONGO_URI));

export async function filingsCollection() {
  await client.connect();
  return client.db("smart_money_nosql").collection("raw_sec_filings");
}
