export interface Address {
  id: string
  label: string
  street: string
  details: string
  isDefault: boolean
}

export interface AddressInput {
  label: string
  street: string
  details: string
  isDefault?: boolean
}

const MOCK_ADDRESSES_KEY = "mock_addresses"

const DEFAULT_MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Casa",
    street: "Carrera 5 # 12-34",
    details: "Apto 302, Torre 2",
    isDefault: true,
  },
]

function isAddress(value: unknown): value is Address {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as Address).id === "string" &&
    typeof (value as Address).label === "string" &&
    typeof (value as Address).street === "string" &&
    typeof (value as Address).details === "string" &&
    typeof (value as Address).isDefault === "boolean"
  )
}

function readPersistedAddresses(): Address[] {
  const stored = localStorage.getItem(MOCK_ADDRESSES_KEY)
  if (!stored) {
    const seeded = DEFAULT_MOCK_ADDRESSES.map((a) => ({ ...a }))
    writePersistedAddresses(seeded)
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isAddress)
  } catch {
    return []
  }
}

function writePersistedAddresses(addresses: Address[]): void {
  localStorage.setItem(MOCK_ADDRESSES_KEY, JSON.stringify(addresses))
}

function genId(): string {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function fetchAddresses(): Promise<Address[]> {
  return readPersistedAddresses()
}

export async function addAddress(input: AddressInput): Promise<Address[]> {
  const addresses = readPersistedAddresses()
  const newAddress: Address = {
    id: genId(),
    label: input.label,
    street: input.street,
    details: input.details,
    isDefault: input.isDefault ?? false,
  }
  if (newAddress.isDefault) {
    for (const a of addresses) {
      a.isDefault = false
    }
  }
  addresses.push(newAddress)
  writePersistedAddresses(addresses)
  return addresses
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<Address[]> {
  const addresses = readPersistedAddresses()
  const existing = addresses.find((a) => a.id === id)
  if (!existing) return addresses
  existing.label = input.label
  existing.street = input.street
  existing.details = input.details
  existing.isDefault = input.isDefault ?? false
  if (existing.isDefault) {
    for (const a of addresses) {
      if (a.id !== id) a.isDefault = false
    }
  }
  writePersistedAddresses(addresses)
  return addresses
}

export async function deleteAddress(id: string): Promise<Address[]> {
  const addresses = readPersistedAddresses()
  const filtered = addresses.filter((a) => a.id !== id)
  writePersistedAddresses(filtered)
  return filtered
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
  const addresses = readPersistedAddresses()
  for (const a of addresses) {
    a.isDefault = a.id === id
  }
  writePersistedAddresses(addresses)
  return addresses
}
