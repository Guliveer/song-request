import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true); // sprawdzanie sesji
  const [canShowForm, setCanShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token") && hash.includes("type=recovery")) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          supabase.auth
            .setSession({
              access_token,
              refresh_token,
            })
            .then(({ error }) => {
              if (!error) {
                window.location.hash = "";
                // Ustaw flagę recovery, aby zablokować przekierowania w loginie
                localStorage.setItem("isRecovery", "true");
                setCanShowForm(true);
                setLoading(false);
              } else {
                setCanShowForm(false);
                setLoading(false);
              }
            });
          return; // Zatrzymaj dalsze sprawdzanie sesji w tym momencie
        }
      }
    }
    // Jeśli nie ma tokenów w URL, sprawdź sesję normalnie
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.aud === "authenticated") {
        setCanShowForm(true);
      } else {
        setCanShowForm(false);
        router.replace("/login");
      }
      setLoading(false);
    });
  }, [router]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !repeatPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("The password must be at least 8 characters long.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      if (error.message && error.message.includes("Password should contain at least one character of each")) {
        setError("The password must contain at least one lowercase letter, one uppercase letter, and one digit.");
      } else {
        setError("An error occurred while changing your password. Please try again.");
      }
    } else {
      // Po udanej zmianie hasła:
      setSuccess("Your password has been changed successfully! Redirecting to homepage...");
      localStorage.removeItem("isRecovery");
      setTimeout(() => {
        router.replace("/");
      }, 1800);
    }
  };

  // Nie renderuj nic, dopóki nie sprawdzisz sesji recovery
  if (loading) {
    return (
      <div className="w-96 mx-auto my-16 p-8 rounded-lg bg-[#222] shadow-lg flex items-center justify-center min-h-[180px]">
        <Spinner size="medium" />
        <Typography className="ml-4">Checking authorization...</Typography>
      </div>
    );
  }

  if (!canShowForm) {
    // Nie renderuj formularza, jeśli nie masz uprawnień
    return null;
  }

  return (
    <div className="w-96 mx-auto my-16 p-8 rounded-lg bg-[#222] shadow-lg">
      <Typography variant="h5" className="text-white mb-4">
        Reset your password
      </Typography>
      <form onSubmit={handleReset} className="space-y-4">
        <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <Input type="password" placeholder="Repeat new password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className="w-full" />
        {error && <Typography className="text-red-500 mt-4">{error}</Typography>}
        {success && <Typography className="text-green-500 mt-4">{success}</Typography>}
        <Button type="submit" className="w-full mt-6">
          Set new password
        </Button>
      </form>
    </div>
  );
}
