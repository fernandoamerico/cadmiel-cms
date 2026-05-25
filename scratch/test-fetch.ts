import { getPayload } from "payload";
import config from "../payload.config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  const payload = await getPayload({ config });
  
  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 1,
  });

  if (posts.docs.length > 0) {
    console.log(JSON.stringify(posts.docs[0].featuredImage, null, 2));
  } else {
    console.log("No posts found.");
  }
  process.exit(0);
}

run();
