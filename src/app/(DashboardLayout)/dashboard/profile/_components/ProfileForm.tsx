"use client";

import { useMemo, useState } from "react";
import { setCookie } from "cookies-next";
import { Image as ImageIcon, Loader2, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateMyProfile } from "@/services/profile";
import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

type ProfileFormProps = {
  initialProfile: UserProfile | null;
  fetchError?: string;
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export default function ProfileForm({ initialProfile, fetchError }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [name, setName] = useState(initialProfile?.name || "");
  const [image, setImage] = useState(initialProfile?.image || "");
  const [removeImage, setRemoveImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(fetchError || "");
  const [success, setSuccess] = useState("");

  const previewImage = useMemo(() => {
    if (removeImage) return "";
    const raw = image.trim();
    if (raw) return raw;
    return profile?.image || "";
  }, [image, profile, removeImage]);

  const persistUserCookie = (nextProfile: UserProfile) => {
    const cookiePayload = {
      ...(profile || {}),
      id: nextProfile.id,
      name: nextProfile.name,
      email: nextProfile.email,
      image: nextProfile.image,
      role: nextProfile.role,
    };

    setCookie("user", JSON.stringify(cookiePayload), { maxAge: COOKIE_MAX_AGE });
    window.dispatchEvent(new Event("auth-change"));
  };

  const buildPayload = (): UpdateProfilePayload | null => {
    const trimmedName = name.trim();
    const currentName = profile?.name || "";
    const currentImage = profile?.image || "";
    const nextImage = image.trim();

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setError("Name must be between 2 and 60 characters.");
      return null;
    }

    const payload: UpdateProfilePayload = {};

    if (trimmedName !== currentName) {
      payload.name = trimmedName;
    }

    if (removeImage) {
      if (currentImage !== "") {
        payload.image = null;
      }
    } else {
      if (nextImage !== currentImage) {
        payload.image = nextImage || null;
      }
    }

    if (Object.keys(payload).length === 0) {
      setSuccess("No changes to update.");
      return null;
    }

    return payload;
  };

  const handleReset = () => {
    if (!profile) return;
    setName(profile.name);
    setImage(profile.image || "");
    setRemoveImage(false);
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
      const response = await updateMyProfile(payload);
      if (!response.success || !response.data) {
        setError(response.message || "Failed to update profile.");
        return;
      }

      setProfile(response.data);
      setName(response.data.name);
      setImage(response.data.image || "");
      setRemoveImage(false);
      setSuccess(response.message || "Profile updated successfully.");
      persistUserCookie(response.data);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
        <p className="text-sm text-destructive font-medium">
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
          {previewImage && <AvatarImage src={previewImage} alt={profile.name} />}
          <AvatarFallback className="bg-muted/50 text-muted-foreground">
            <UserRound className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <div className="relative z-10">
          <h2 className="text-xl font-bold font-heading text-foreground">{profile.name}</h2>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">{profile.email}</p>
        </div>
        <div className="w-full text-left space-y-2.5 text-sm bg-muted/30 p-4 rounded-2xl border border-border/50 relative z-10">
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Role</span>
            <span className="font-bold text-foreground capitalize px-2 py-0.5 bg-background rounded-md border border-border shadow-sm">{profile.role}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Joined</span>
            <span className="font-bold text-foreground font-mono">
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })
                : "N/A"}
            </span>
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

        <div className="space-y-3">
          <Label htmlFor="profile-name" className="text-foreground font-bold">Full Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={60}
            placeholder="Enter your full name"
            className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12"
          />
          <p className="text-xs font-medium text-muted-foreground pl-1">2 to 60 characters.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="profile-email" className="text-foreground font-bold">Email Address</Label>
          <Input 
            id="profile-email" 
            value={profile.email} 
            disabled 
            className="rounded-xl border-border bg-muted/30 opacity-70 h-12 cursor-not-allowed"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="profile-image" className="flex items-center gap-2 text-foreground font-bold">
            <ImageIcon className="w-4 h-4 text-primary" />
            Profile Image URL
          </Label>
          <Input
            id="profile-image"
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
              Leave blank or click remove to use default avatar.
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
