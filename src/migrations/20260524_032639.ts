import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_aeo_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_posts_v_version_aeo_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "aeo_quick_answer" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aeo_quick_answer" varchar;
  ALTER TABLE "posts_aeo_faqs" ADD CONSTRAINT "posts_aeo_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_aeo_faqs" ADD CONSTRAINT "_posts_v_version_aeo_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_aeo_faqs_order_idx" ON "posts_aeo_faqs" USING btree ("_order");
  CREATE INDEX "posts_aeo_faqs_parent_id_idx" ON "posts_aeo_faqs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_aeo_faqs_order_idx" ON "_posts_v_version_aeo_faqs" USING btree ("_order");
  CREATE INDEX "_posts_v_version_aeo_faqs_parent_id_idx" ON "_posts_v_version_aeo_faqs" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_aeo_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_aeo_faqs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_aeo_faqs" CASCADE;
  DROP TABLE "_posts_v_version_aeo_faqs" CASCADE;
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "posts" DROP COLUMN "aeo_quick_answer";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aeo_quick_answer";`)
}
