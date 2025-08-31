import { createClient } from "@supabase/supabase-js";

// Create Supabase client
export const supabaseStorageClient = createClient(
  process.env["SUPABASE_PROJECT_URL"] as string,
  process.env["SUPABASE_API_KEY"] as string
).storage.from(process.env.SUPABASE_BUCKET_NAME as string);
