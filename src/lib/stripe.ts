import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key && !key.includes("placeholder")
  ? new Stripe(key, { apiVersion: "2026-04-22.dahlia" as any, typescript: true })
  : null as unknown as Stripe;

export { PLANS, formatPrice } from "./plans";
export type { PlanKey } from "./plans";
