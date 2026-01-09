import { createClient } from "@supabase/supabase-js";

// Klient z service_role key - omija RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // Sprawdź autoryzację
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Sprawdź czy istnieje rekord w tabeli keep_alive
    const { data: existingRecord, error: selectError } = await supabaseAdmin.from("keep_alive").select("id").limit(1).single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = no rows returned, co jest OK
      throw selectError;
    }

    let result;

    if (existingRecord) {
      // Aktualizuj istniejący rekord
      const { data, error } = await supabaseAdmin.from("keep_alive").update({ updated_at: new Date().toISOString() }).eq("id", existingRecord.id).select();

      if (error) throw error;
      result = data;
    } else {
      // Wstaw nowy rekord
      const { data, error } = await supabaseAdmin.from("keep_alive").insert({ updated_at: new Date().toISOString() }).select();

      if (error) throw error;
      result = data;
    }

    return res.status(200).json({
      success: true,
      message: "Keep-alive ping successful",
      updated_at: result?.[0]?.updated_at,
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
