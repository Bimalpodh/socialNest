const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

exports.deleteExpiredStories = functions.pubsub
  .schedule("every 1 hours") // Runs every hour
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const oneDayAgo = new admin.firestore.Timestamp(now.seconds - 86400, now.nanoseconds); // 24 hours ago

    const storiesRef = db.collection("stories");
    const snapshot = await storiesRef.where("createdAt", "<", oneDayAgo).get();

    const deletePromises = snapshot.docs.map(async (doc) => {
      const { cloudinaryId } = doc.data();

      // 1️⃣ Delete from Cloudinary
      const cloudinaryDeleteUrl = `https://api.cloudinary.com/v1_1/desmliwsi/image/destroy`;
      
      await axios.post(cloudinaryDeleteUrl, {
        public_id: cloudinaryId,
        api_key: "your_cloudinary_api_key",
      });

      // 2️⃣ Delete from Firestore
      await doc.ref.delete();
    });

    await Promise.all(deletePromises);
    console.log("Expired stories deleted!");
  });
