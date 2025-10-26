import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { supabase } from "@/lib/supabase";
import EmojiPicker from "emoji-picker-react";
import { Edit, User, Palette, Smile, X } from "lucide-react";
import { getCurrentUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [tempUsername, setTempUsername] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [emojiDialogOpen, setEmojiDialogOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(null);
  const [tempColor, setTempColor] = useState("");
  const [tempEmoji, setTempEmoji] = useState(null);

  //zmiana hasla
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Nowe: stan na oczekujące zmiany
  const [pendingChanges, setPendingChanges] = useState({
    username: null,
    color: null,
    emoji: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("users").select("username, color, emoji").eq("id", user.user.id).single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile({ username: data.username });
        setAvatarColor(data.color || "#FFFFFF");
        setAvatarEmoji(data.emoji || null);
      }

      // Wczytaj cache z localStorage
      setPendingChanges({
        username: localStorage.getItem("pendingUsername"),
        color: localStorage.getItem("pendingColor"),
        emoji: localStorage.getItem("pendingEmoji"),
      });
    };

    fetchProfile();
  }, []);

  // Zmiana nazwy użytkownika – zapis do cache
  const handleSaveUsernameToCache = async () => {
    if (!tempUsername.trim()) return;

    const { data: existing } = await supabase.from("users").select("id").eq("username", tempUsername).maybeSingle();

    if (existing) {
      setUsernameTaken(true);
      return;
    }

    localStorage.setItem("pendingUsername", tempUsername);
    setPendingChanges((prev) => ({ ...prev, username: tempUsername }));
    setOpenDialog(false);
  };

  // Zmiana koloru – zapis do cache
  const handleSaveColorToCache = () => {
    localStorage.setItem("pendingColor", tempColor);
    setPendingChanges((prev) => ({ ...prev, color: tempColor }));
    setColorDialogOpen(false);
  };

  // Zmiana emoji – zapis do cache
  const handleSaveEmojiToCache = () => {
    const emojiValue = tempEmoji || null;
    localStorage.setItem("pendingEmoji", emojiValue);
    setPendingChanges((prev) => ({ ...prev, emoji: emojiValue }));
    setEmojiDialogOpen(false);
  };

  // Usuwanie emoji – zapis do cache
  const handleRemoveEmojiFromCache = () => {
    localStorage.setItem("pendingEmoji", "");
    setPendingChanges((prev) => ({ ...prev, emoji: "" }));
    setEmojiDialogOpen(false);
  };

  // Globalny zapis do bazy danych
  const handleGlobalSave = async () => {
    const updates = {};
    const user = await getCurrentUser();

    if (!user) return;

    if (pendingChanges.username) updates.username = pendingChanges.username;
    if (pendingChanges.color) updates.color = pendingChanges.color;
    if (pendingChanges.emoji !== null) updates.emoji = pendingChanges.emoji === "" ? null : pendingChanges.emoji;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase.from("users").update(updates).eq("id", user.id);

    if (!error) {
      localStorage.removeItem("pendingUsername");
      localStorage.removeItem("pendingColor");
      localStorage.removeItem("pendingEmoji");
      window.location.reload();
      setPendingChanges({ username: null, color: null, emoji: null });
    } else {
      console.error("Error saving changes:", error);
      throw new Error("Failed to save changes: " + error.message);
    }
  };

  // Obsługa zmiany hasła
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || !repeatPassword) {
      setPasswordError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("The password must be at least 8 characters long.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setPasswordError("You are not logged in. Please log in again.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      if (error.message && error.message.includes("Password should contain at least one character of each")) {
        setPasswordError("The password must contain at least one lowercase letter, one uppercase letter, and one digit.");
      } else {
        setPasswordError("An error occurred while changing your password. Please try again, or make sure you are not using your current password.");
      }
    } else {
      setPasswordSuccess("Your password has been changed successfully.");
      setNewPassword("");
      setRepeatPassword("");
      setTimeout(handleClosePasswordDialog, 1500);
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setNewPassword("");
    setRepeatPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");

  const removeUnverifiedFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data?.all?.length) {
      await Promise.all(data.all.filter((factor) => factor.status === "unverified").map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));
    }
  };

  // Funkcja do rozpoczęcia enrollowania MFA
  const handleEnableMfa = async () => {
    setMfaError("");
    setMfaSuccess("");
    setVerifyCode("");
    setQrCode("");
    setFactorId("");
    setTotpSecret("");
    setMfaDialogOpen(true);

    await removeUnverifiedFactors();

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });

    if (error) {
      setMfaError(error.message);
      return;
    }
    if (!data.totp?.qr_code) {
      setMfaError("QR code not received from Supabase. Try again in a few seconds.");
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setTotpSecret(data.totp.secret);
  };

  // Funkcja do weryfikacji kodu z aplikacji Authenticator
  const handleVerifyMfa = async () => {
    setMfaError("");
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setMfaError(challenge.error.message);
      return;
    }
    const challengeId = challenge.data.id;
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: verifyCode.trim(),
    });
    if (verify.error) {
      setMfaError(verify.error.message);
    } else {
      setMfaSuccess("Two-Factor Authentication enabled successfully!");
      setTimeout(() => setMfaDialogOpen(false), 1500);
    }
  };

  const [has2faEnabled, setHas2faEnabled] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");

  // Sprawdź status 2FA po załadowaniu komponentu
  useEffect(() => {
    const check2fa = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return;
      const totp = data?.all?.find((f) => (f.factor_type === "totp" || f.factorType === "totp") && f.status === "verified");
      if (totp) {
        setHas2faEnabled(true);
        setTotpFactorId(totp.id);
      } else {
        setHas2faEnabled(false);
        setTotpFactorId("");
      }
    };
    check2fa();
  }, [mfaDialogOpen, mfaSuccess]);

  const handleDisable2fa = async () => {
    if (!totpFactorId) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
    if (error) {
      setMfaError(error.message);
    } else {
      setHas2faEnabled(false);
      setTotpFactorId("");
      setMfaSuccess("Two-Factor Authentication disabled!");
      setTimeout(() => setMfaSuccess(""), 1500);
    }
  };

  const [disable2faDialogOpen, setDisable2faDialogOpen] = useState(false);
  const [disable2faCode, setDisable2faCode] = useState("");
  const [disable2faError, setDisable2faError] = useState("");

  const handleDisable2faWithCode = async () => {
    setDisable2faError("");
    // 1. Challenge MFA
    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.error) {
      setDisable2faError(challenge.error.message);
      return;
    }
    // 2. Verify MFA
    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challenge.data.id,
      code: disable2faCode.trim(),
    });
    if (verify.error) {
      setDisable2faError(verify.error.message);
      return;
    }
    // 3. Unenroll MFA
    const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
    if (error) {
      setDisable2faError(error.message);
    } else {
      setHas2faEnabled(false);
      setTotpFactorId("");
      setMfaSuccess("Two-Factor Authentication disabled!");
      setDisable2faDialogOpen(false);
      setTimeout(() => setMfaSuccess(""), 1500);
    }
  };

  const [totpSecret, setTotpSecret] = useState("");

  return (
    <>
      <Typography variant="h5" className="text-white font-medium">
        Account Settings
      </Typography>
      <Separator className="my-4" />

      {/* Account settings list */}
      <div className="space-y-6">
        {/* Username setting */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <User className="text-[#8FE6D5] mr-3 h-5 w-5" />
            <div>
              <Typography variant="body1" className="text-white font-medium">
                Username
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="body2" className={`${pendingChanges.username ? "text-[#8FE6D5]" : "text-gray-400"}`}>
                  {pendingChanges.username || profile?.username}
                </Typography>
                {pendingChanges.username && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0 text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
                    onClick={() => {
                      localStorage.removeItem("pendingUsername");
                      setPendingChanges((prev) => ({ ...prev, username: null }));
                    }}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
            onClick={() => {
              setTempUsername(pendingChanges.username || profile?.username || "");
              setUsernameTaken(false);
              setOpenDialog(true);
            }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Avatar color setting */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <Palette className="text-[#8FE6D5] mr-3 h-5 w-5" />
            <div>
              <Typography variant="body1" className="text-white font-medium">
                Avatar Color
              </Typography>
              <div className="flex items-center mt-1">
                <div className="w-6 h-6 rounded-full border border-gray-600" style={{ backgroundColor: pendingChanges.color || avatarColor }} />
                {pendingChanges.color && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0 text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
                    onClick={() => {
                      localStorage.removeItem("pendingColor");
                      setPendingChanges((prev) => ({ ...prev, color: null }));
                    }}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
            onClick={() => {
              setTempColor(pendingChanges.color || avatarColor);
              setColorDialogOpen(true);
            }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Avatar emoji setting */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <Smile className="text-[#8FE6D5] mr-3 h-5 w-5" />
            <div>
              <Typography variant="body1" className="text-white font-medium">
                Avatar Emoji
              </Typography>
              <div className="flex items-center mt-1">
                <Typography variant="body2" className={`${pendingChanges.emoji ? "text-[#8FE6D5]" : "text-white"}`}>
                  {pendingChanges.emoji !== null ? pendingChanges.emoji || "None" : avatarEmoji || "None"}
                </Typography>
                {pendingChanges.emoji && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0 text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
                    onClick={() => {
                      localStorage.removeItem("pendingEmoji");
                      setPendingChanges((prev) => ({ ...prev, emoji: null }));
                    }}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8FE6D5] hover:bg-[#8FE6D5]/10"
            onClick={() => {
              setTempEmoji(pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji);
              setEmojiDialogOpen(true);
            }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Globalny przycisk Save */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleGlobalSave} disabled={!Object.values(pendingChanges).some((val) => val !== null && val !== undefined)} className="bg-[#8FE6D5] text-black hover:bg-[#6fc3b2]">
          Save All Changes
        </Button>
      </div>

      {/* Color picker dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Avatar Color</DialogTitle>
          </DialogHeader>
          <div className="flex flex-row gap-4 justify-center items-center p-4">
            <SketchPicker color={tempColor} onChangeComplete={(color) => setTempColor(color.hex)} />
            <div className="w-24 h-24 rounded-full border border-gray-600 flex items-center justify-center" style={{ backgroundColor: tempColor }}>
              {(pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji) && <span className="text-4xl">{pendingChanges.emoji !== null ? pendingChanges.emoji : avatarEmoji}</span>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveColorToCache} className="text-[#8FE6D5] hover:bg-[#8FE6D5]/10">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Username change dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Change username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Typography variant="body2" className="text-gray-400">
              Old username: <strong className="text-white">{profile?.username}</strong>
            </Typography>
            <Input
              placeholder="New username"
              value={tempUsername}
              onChange={(e) => {
                setTempUsername(e.target.value);
                setUsernameTaken(false);
              }}
              className="rounded-2xl"
            />
            {usernameTaken && (
              <Typography variant="body2" className="text-red-500 mt-2">
                This username is already taken.
              </Typography>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUsernameToCache} disabled={!tempUsername.trim()} className={`${tempUsername.trim() ? "text-[#8FE6D5] hover:bg-[#8FE6D5]/10" : "text-gray-400"}`}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emoji picker dialog */}
      <Dialog open={emojiDialogOpen} onOpenChange={setEmojiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Choose your avatar emoji</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Typography variant="body1" className="mb-2 text-white">
                Selected:
              </Typography>
              <div className="w-16 h-16 rounded-full border border-gray-600 flex items-center justify-center mb-4" style={{ backgroundColor: pendingChanges.color || avatarColor }}>
                {tempEmoji && <span className="text-3xl">{tempEmoji}</span>}
              </div>
            </div>
            <EmojiPicker
              lazyLoadEmojis={true}
              theme="dark"
              onEmojiClick={(emojiObject) => {
                setTempEmoji(emojiObject.emoji);
              }}
              width="100%"
              suggestedEmojisMode="recent"
            />
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleRemoveEmojiFromCache} disabled={!avatarEmoji && !pendingChanges.emoji}>
              Remove
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setEmojiDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmojiToCache} disabled={!tempEmoji} className={`${tempEmoji ? "hover:bg-[#8FE6D5]/10" : ""}`}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" className="text-[#8FE6D5] border-[#8FE6D5] hover:bg-[#8FE6D5]/10 mt-4" onClick={() => setShowPasswordDialog(true)}>
        Change password
      </Button>

      <div className="mt-6">
        {has2faEnabled ? (
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => setDisable2faDialogOpen(true)}>
            Disable Two-Factor Authentication (2FA)
          </Button>
        ) : (
          <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500/10" onClick={handleEnableMfa}>
            Enable Two-Factor Authentication (2FA)
          </Button>
        )}
        {mfaError && <Typography className="text-red-500 mt-2">{mfaError}</Typography>}
        {mfaSuccess && <Typography className="text-green-500 mt-2">{mfaSuccess}</Typography>}
      </div>

      {/* Disable 2FA Dialog */}
      <Dialog open={disable2faDialogOpen} onOpenChange={setDisable2faDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Typography className="mb-4">To disable 2FA, enter the current code from your Authenticator app.</Typography>
            <Input placeholder="6-digit code" value={disable2faCode} onChange={(e) => setDisable2faCode(e.target.value)} maxLength={6} className="text-center tracking-widest" />
            {disable2faError && <Typography className="text-red-500 mt-2">{disable2faError}</Typography>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisable2faDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisable2faWithCode} disabled={!disable2faCode} variant="destructive">
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable MFA Dialog */}
      <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold">Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Krok 1: Instrukcja */}
            <Typography variant="body1" className="text-[#8FE6D5]">
              Step 1: Scan the QR code below with your Authenticator app
            </Typography>
            <Typography variant="body2" className="text-gray-300">
              Use apps like <strong>Google Authenticator</strong>, <strong>Authy</strong> or <strong>Microsoft Authenticator</strong>. If you can't scan, you can manually enter the code shown below.
            </Typography>

            {/* QR code */}
            {qrCode && (
              <>
                <Typography variant="body2" className="mb-4">
                  Scan this QR code with your Authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
                </Typography>
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR code" width={220} height={220} className="bg-white p-2 rounded" />
                </div>
              </>
            )}

            {totpSecret && (
              <div className="flex justify-center w-full">
                <div className="mt-4 mb-2 px-6 py-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center shadow-lg max-w-sm mx-auto text-center">
                  <Typography variant="subtitle2" className="text-[#8FE6D5] font-bold tracking-wide mb-2">
                    Manual setup code
                  </Typography>
                  <Typography variant="body1" className="text-white font-mono text-lg tracking-wider break-all mb-2 text-center bg-gray-900 px-4 py-2 rounded shadow-inner" title={totpSecret}>
                    {totpSecret}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 text-center">
                    If you can't scan the QR code, copy and enter this code manually in your authenticator app.
                  </Typography>
                </div>
              </div>
            )}

            {/* Krok 2: Kod z aplikacji */}
            <Separator className="my-6" />
            <Typography variant="body1" className="text-[#8FE6D5]">
              Step 2: Enter the 6-digit code from your app
            </Typography>
            <Input placeholder="6-digit code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} className="text-center tracking-widest font-semibold text-lg" autoFocus maxLength={6} />

            {/* Komunikaty */}
            {mfaError && <Typography className="text-red-500 mt-2">{mfaError}</Typography>}
            {mfaSuccess && <Typography className="text-green-500 mt-2">{mfaSuccess}</Typography>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMfaDialogOpen(false)} className="text-gray-400">
              Cancel
            </Button>
            <Button onClick={handleVerifyMfa} disabled={!verifyCode || !factorId} className="bg-[#8FE6D5] text-black font-bold hover:bg-[#6fd1b5]">
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input placeholder="Repeat new password" type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
            {passwordError && <Typography className="text-red-500">{passwordError}</Typography>}
            {passwordSuccess && <Typography className="text-green-500">{passwordSuccess}</Typography>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePasswordDialog}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
