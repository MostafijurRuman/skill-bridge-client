"use client";

import { useMemo, useState } from "react";
import { setCookie } from "cookies-next";
import { Image as ImageIcon, Loader2, Save, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTutorAndUserProfile } from "@/services/tutor-management";
import type { UserProfile } from "@/types/profile";
import type {
  TutorCombinedProfileUpdatePayload,
  TutorDashboardData,
} from "@/types/tutor-dashboard";

type TutorProfileFormProps = {
  initialUserProfile: UserProfile | null;
  initialTutorProfile: TutorDashboardData | null;
  fetchError?: string;
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const roundPrice = (value: number) => Math.round(value * 100) / 100;

export default function TutorProfileForm({
  initialUserProfile,
  initialTutorProfile,
  fetchError,
}: TutorProfileFormProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [tutorProfile, setTutorProfile] = useState<TutorDashboardData | null>(initialTutorProfile);

  const [name, setName] = useState(initialUserProfile?.name || "");
  const [image, setImage] = useState(initialUserProfile?.image || "");
  const [removeImage, setRemoveImage] = useState(false);
  const [bio, setBio] = useState(initialTutorProfile?.bio || "");
  const [pricePerHr, setPricePerHr] = useState(
    initialTutorProfile?.pricePerHr ? String(initialTutorProfile.pricePerHr) : ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(fetchError || "");
  const [success, setSuccess] = useState("");

  const previewImage = useMemo(() => {
    if (removeImage) return "";
    const typedImage = image.trim();
    if (typedImage) return typedImage;
    return userProfile?.image || "";
  }, [image, removeImage, userProfile]);

  const persistUserCookie = (nextUser: UserProfile) => {
    const cookiePayload = {
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      image: nextUser.image,
      role: nextUser.role,
    };

    setCookie("user", JSON.stringify(cookiePayload), { maxAge: COOKIE_MAX_AGE });
    window.dispatchEvent(new Event("auth-change"));
  };

  const buildPayload = (): TutorCombinedProfileUpdatePayload | null => {
    const payload: TutorCombinedProfileUpdatePayload = {};
    const trimmedName = name.trim();
    const trimmedImage = image.trim();
    const trimmedBio = bio.trim();
    const currentName = userProfile?.name || "";
    const currentImage = userProfile?.image || "";
    const currentBio = tutorProfile?.bio || "";
    const currentPrice = roundPrice(tutorProfile?.pricePerHr || 0);
    const parsedPrice = Number(pricePerHr.trim());

    if (userProfile) {
      if (trimmedName.length < 2 || trimmedName.length > 60) {
        setError("Name must be between 2 and 60 characters.");
        return null;
      }

      if (trimmedName !== currentName) {
        payload.name = trimmedName;
      }

      if (removeImage) {
        if (currentImage) {
          payload.image = null;
        }
      } else if (trimmedImage !== currentImage) {
        payload.image = trimmedImage || null;
      }
    }

    if (tutorProfile || trimmedBio || pricePerHr.trim()) {
      if (trimmedBio.length < 20) {
        setError("Tutor bio should be at least 20 characters.");
        return null;
      }

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        setError("Price per hour must be a positive number.");
        return null;
      }

      if (trimmedBio !== currentBio) {
        payload.bio = trimmedBio;
      }

      if (roundPrice(parsedPrice) !== currentPrice) {
        payload.pricePerHr = roundPrice(parsedPrice);
      }
    }

    if (Object.keys(payload).length === 0) {
      setSuccess("No changes to update.");
      return null;
    }

    return payload;
  };

  const handleReset = () => {
    setName(userProfile?.name || "");
    setImage(userProfile?.image || "");
    setRemoveImage(false);
    setBio(tutorProfile?.bio || "");
    setPricePerHr(tutorProfile?.pricePerHr ? String(tutorProfile.pricePerHr) : "");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = buildPayload();
    if (!payload) return;

    setIsSaving(true);
    try {
      const response = await updateTutorAndUserProfile(payload);
      const actionData = response.data;

      if (actionData?.updatedUser && actionData.user) {
        setUserProfile(actionData.user);
        setName(actionData.user.name);
        setImage(actionData.user.image || "");
        setRemoveImage(false);
        persistUserCookie(actionData.user);
      }

      if (actionData?.updatedTutor) {
        if (actionData.tutor) {
          setTutorProfile(actionData.tutor);
          setBio(actionData.tutor.bio || "");
          setPricePerHr(String(actionData.tutor.pricePerHr || ""));
        } else {
          if (typeof payload.bio === "string") setBio(payload.bio);
          if (typeof payload.pricePerHr === "number") setPricePerHr(String(payload.pricePerHr));
          setTutorProfile((prev) =>
            prev
              ? {
                  ...prev,
                  bio: typeof payload.bio === "string" ? payload.bio : prev.bio,
                  pricePerHr:
                    typeof payload.pricePerHr === "number"
                      ? payload.pricePerHr
                      : prev.pricePerHr,
                }
              : prev
          );
        }
      }

      if (!response.success) {
        setError(response.message || "Failed to update profile.");
        return;
      }

      setSuccess(response.message || "Profile updated successfully.");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!userProfile && !tutorProfile) {
    return (
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
        <p className="text-sm font-medium text-destructive">
          {error || "Unable to load profile data. Please refresh and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center gap-5 h-fit relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <Avatar className="w-28 h-28 border-[3px] border-background shadow-md bg-muted/50 relative z-10">
          {previewImage && <AvatarImage src={previewImage} alt={name || "Tutor"} />}
          <AvatarFallback className="bg-muted/50 text-muted-foreground">
            <UserRound className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>

        <div className="relative z-10">
          <h2 className="text-xl font-bold font-heading text-foreground">{name || "Tutor"}</h2>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">{userProfile?.email || "N/A"}</p>
        </div>

        <div className="w-full text-left space-y-2.5 text-sm bg-muted/30 p-4 rounded-2xl border border-border/50 relative z-10">
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Role</span>
            <span className="font-bold text-foreground capitalize px-2 py-0.5 bg-background rounded-md border border-border shadow-sm">{userProfile?.role || "TUTOR"}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Rating</span>
            <span className="font-bold text-foreground font-mono">{(tutorProfile?.rating || 0).toFixed(1)} / 5</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Subjects</span>
            <span className="font-bold text-foreground font-mono">{tutorProfile?.categories?.length || 0}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-6"
      >
        {error && (
          <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-bold shadow-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-3">
            <Label htmlFor="tutor-name" className="text-foreground font-bold">Full Name</Label>
            <Input
              id="tutor-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={60}
              placeholder="Enter your full name"
              className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="tutor-email" className="text-foreground font-bold">Email Address</Label>
            <Input 
              id="tutor-email" 
              value={userProfile?.email || ""} 
              disabled 
              className="rounded-xl border-border bg-muted/30 opacity-70 h-12 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="tutor-image" className="flex items-center gap-2 text-foreground font-bold">
            <ImageIcon className="w-4 h-4 text-primary" />
            Profile Image URL
          </Label>
          <Input
            id="tutor-image"
            value={image}
            onChange={(event) => {
              setImage(event.target.value);
              setRemoveImage(false);
            }}
            placeholder="https://cdn.example.com/avatar.jpg"
            className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12"
          />
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs font-medium text-muted-foreground pl-1">
              Leave blank or remove to use default avatar.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setImage("");
                setRemoveImage(true);
              }}
              className="rounded-lg h-8 text-xs font-bold border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              Remove Image
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="tutor-bio" className="text-foreground font-bold">Tutor Bio</Label>
          <textarea
            id="tutor-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell students how you teach, your strengths, and subjects you focus on."
            className="min-h-[140px] w-full border border-border bg-muted/50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y text-foreground"
          />
          <p className="text-xs font-medium text-muted-foreground pl-1">Minimum 20 characters.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="tutor-price" className="text-foreground font-bold">Price Per Hour (USD)</Label>
          <Input
            id="tutor-price"
            type="number"
            min="1"
            step="0.01"
            value={pricePerHr}
            onChange={(event) => setPricePerHr(event.target.value)}
            placeholder="50"
            className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12"
          />
        </div>

        <div className="pt-4 flex items-center gap-3 border-t border-border mt-4">
          <Button type="submit" disabled={isSaving} className="min-w-36 h-11 rounded-xl font-bold bg-primary hover:bg-primary-dark shadow-md">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving} className="h-11 rounded-xl font-bold border-border bg-card hover:bg-muted/50">
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
