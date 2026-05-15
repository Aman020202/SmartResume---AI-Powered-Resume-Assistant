import mongoose from "mongoose";

const dropStaleResumeIndexes = async () => {
  try {
    const collection = mongoose.connection.collection("resumes");
    const indexes = await collection.indexes();

    for (const idx of indexes) {
      const hasTitleIndex = idx.key && (idx.key.title === 1 || (idx.key.user === 1 && idx.key.title === 1));
      if (hasTitleIndex) {
        await collection.dropIndex(idx.name);
        console.log(`Dropped stale index ${idx.name} from resumes collection`);
      }
    }
  } catch (error) {
    if (error.codeName !== "IndexNotFound") {
      console.warn("Could not drop stale resume index:", error.message);
    }
  }
};

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
        await dropStaleResumeIndexes();
    }catch(error){
        console.error("MongoDB connection failed", error.message);
        process.exit(1);
    }
};

export default connectDB;