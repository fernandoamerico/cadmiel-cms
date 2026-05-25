import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function run() {
  const { getPayload } = await import("payload");
  const config = (await import("../payload.config")).default;
  const payload = await getPayload({ config });
  
  const posts = await payload.find({
    collection: "posts",
    sort: "-createdAt",
    limit: 1
  });
  
  if (posts.docs.length > 0) {
    console.log(JSON.stringify(posts.docs[0].content, null, 2));
  }
  process.exit(0);
}
run();
