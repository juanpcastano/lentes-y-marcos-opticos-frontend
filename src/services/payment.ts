import { confirmPayment } from "#/services/orders"

function genTransactionId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function simulatePaymentRedirect(
  orderId: string,
): Promise<{ transactionId: string; status: "paid" }> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const transactionId = genTransactionId()
  await confirmPayment(orderId, transactionId)
  return { transactionId, status: "paid" }
}
