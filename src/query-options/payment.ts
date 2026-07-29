import { queryOptions } from "@tanstack/react-query"
import { simulatePaymentRedirect } from "#/services/payment"

export const PAYMENT_QUERY_KEY = ["payment", "simulate"] as const

export function createPaymentMutation() {
  return {
    mutationKey: PAYMENT_QUERY_KEY,
    mutationFn: simulatePaymentRedirect,
  }
}
