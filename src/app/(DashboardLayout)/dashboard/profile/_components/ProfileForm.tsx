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
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <p className="text-sm text-red-600">
          {error || "Unable to load profile data. Please refresh and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-4 h-fit">
        <Avatar className="w-24 h-24 border border-border bg-slate-100">
          {previewImage && <AvatarImage src={previewImage} alt={profile.name} />}
          <AvatarFallback className="bg-slate-100">
            <UserRound className="w-10 h-10 text-slate-400" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="w-full text-left space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Role:</span>{" "}
            <span className="font-medium">{profile.role}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Created:</span>{" "}
            <span className="font-medium">
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US")
                : "N/A"}
            </span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5"
      >
        {error && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={60}
            placeholder="Enter your full name"
          />
          <p className="text-xs text-muted-foreground">2 to 60 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={profile.email} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-image" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
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
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Leave blank or click remove to set image as null.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setImage("");
                setRemoveImage(true);
              }}
            >
              Remove Image
            </Button>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button type="submit" disabled={isSaving} className="min-w-36">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
