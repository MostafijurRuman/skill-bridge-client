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
          {previewImage && <AvatarImage src={previewImage} alt={name || "Tutor"} />}
          <AvatarFallback className="bg-slate-100">
            <UserRound className="w-10 h-10 text-slate-400" />
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">{name || "Tutor"}</h2>
          <p className="text-sm text-muted-foreground">{userProfile?.email || "N/A"}</p>
        </div>

        <div className="w-full text-left space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Role:</span>{" "}
            <span className="font-medium">{userProfile?.role || "TUTOR"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Rating:</span>{" "}
            <span className="font-medium">{(tutorProfile?.rating || 0).toFixed(1)} / 5</span>
          </p>
          <p>
            <span className="text-muted-foreground">Subjects:</span>{" "}
            <span className="font-medium">{tutorProfile?.categories?.length || 0}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tutor-name">Name</Label>
            <Input
              id="tutor-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={60}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tutor-email">Email</Label>
            <Input id="tutor-email" value={userProfile?.email || ""} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tutor-image" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
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
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Leave blank or remove to set image as null.
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

        <div className="space-y-2">
          <Label htmlFor="tutor-bio">Tutor Bio</Label>
          <textarea
            id="tutor-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell students how you teach, your strengths, and subjects you focus on."
            className="min-h-[130px] w-full border border-input rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white resize-y"
          />
          <p className="text-xs text-muted-foreground">Minimum 20 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tutor-price">Price Per Hour (USD)</Label>
          <Input
            id="tutor-price"
            type="number"
            min="1"
            step="0.01"
            value={pricePerHr}
            onChange={(event) => setPricePerHr(event.target.value)}
            placeholder="50"
          />
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
