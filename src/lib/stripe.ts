"use client";

import { loadStripe } from "@stripe/stripe-js";

export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;
