import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MapPin, Plus, X } from "lucide-react"
import createCartQueryOptions from "#/query-options/cart"
import createAddressesQueryOptions, {
  useAddAddress,
} from "#/query-options/addresses"
import createShippingDatesQueryOptions from "#/query-options/shipping-dates"
import { createOrder, formatCop  } from "#/services/orders"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group"
import { toast } from "#/hooks/use-toast"
import type { Address } from "#/services/addresses"

export const Route = createFileRoute("/_main-layout/_authenticated/checkout")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: cart } = useQuery(createCartQueryOptions())
  const { data: addresses } = useQuery(createAddressesQueryOptions())
  const { data: shippingDates } = useQuery(createShippingDatesQueryOptions())
  const addAddressMutation = useAddAddress()

  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newStreet, setNewStreet] = useState("")
  const [newDetails, setNewDetails] = useState("")
  const [addressErrors, setAddressErrors] = useState<{
    label?: string
    street?: string
  }>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (cart && cart.items.length === 0) {
      navigate({ to: "/cart" })
    }
  }, [cart, navigate])

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault)
      setSelectedAddressId(defaultAddr?.id ?? addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  useEffect(() => {
    if (shippingDates && shippingDates.length > 0 && !selectedDate) {
      setSelectedDate(shippingDates[0])
    }
  }, [shippingDates, selectedDate])

  function handleSaveAddress() {
    const errors: { label?: string; street?: string } = {}
    if (!newLabel.trim()) errors.label = "El nombre es obligatorio"
    if (!newStreet.trim()) errors.street = "La dirección es obligatoria"
    setAddressErrors(errors)
    if (Object.keys(errors).length > 0) return

    addAddressMutation.mutate(
      {
        label: newLabel.trim(),
        street: newStreet.trim(),
        details: newDetails.trim(),
      },
      {
        onSuccess: (updatedAddresses) => {
          const newAddr = updatedAddresses[updatedAddresses.length - 1]
          setSelectedAddressId(newAddr.id)
          setShowAddAddress(false)
          setNewLabel("")
          setNewStreet("")
          setNewDetails("")
          toast({ variant: "success", title: "Dirección agregada" })
        },
      },
    )
  }

  function handleCancelAddAddress() {
    setShowAddAddress(false)
    setNewLabel("")
    setNewStreet("")
    setNewDetails("")
    setAddressErrors({})
  }

  const placeOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      navigate({
        to: "/checkout/redirect",
        search: { orderId: order.id },
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error al procesar el pedido",
      })
      setSubmitting(false)
    },
  })

  function handlePlaceOrder() {
    if (!selectedAddressId || !selectedDate) {
      toast({
        variant: "destructive",
        title: "Selecciona una dirección y una fecha de envío",
      })
      return
    }
    if (!cart || cart.items.length === 0) return

    const address = addresses?.find((a) => a.id === selectedAddressId)
    if (!address) return

    setSubmitting(true)
    placeOrderMutation.mutate({
      items: cart.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      shippingAddress: {
        id: address.id,
        label: address.label,
        street: address.street,
        details: address.details,
      },
      shippingDate: selectedDate,
    })
  }

  if (!cart || !addresses || !shippingDates) return null

  const selectedAddr = addresses.find((a) => a.id === selectedAddressId)
  const daysAway = selectedDate
    ? Math.ceil(
        (new Date(selectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : 0
  const blocked = submitting || placeOrderMutation.isPending

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finalizar Compra</h1>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5" />
              Dirección de envío
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!showAddAddress && addresses.length > 0 && (
              <RadioGroup
                value={selectedAddressId}
                onValueChange={setSelectedAddressId}
              >
                {addresses.map((addr) => (
                  <Label
                    key={addr.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={addr.id} className="mt-1" />
                    <div className="grid gap-0.5">
                      <span className="font-medium">{addr.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {addr.street}
                      </span>
                      {addr.details && (
                        <span className="text-sm text-muted-foreground">
                          {addr.details}
                        </span>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {!showAddAddress && (
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-2"
                onClick={() => setShowAddAddress(true)}
              >
                <Plus className="size-4" />
                Agregar nueva dirección
              </Button>
            )}

            {showAddAddress && (
              <div className="grid gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nueva dirección</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={handleCancelAddAddress}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr-label">Nombre</Label>
                  <Input
                    id="addr-label"
                    placeholder="Casa, Oficina, etc."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                  {addressErrors.label && (
                    <p className="text-sm text-destructive">
                      {addressErrors.label}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr-street">Dirección</Label>
                  <Input
                    id="addr-street"
                    placeholder="Carrera 5 # 12-34"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                  />
                  {addressErrors.street && (
                    <p className="text-sm text-destructive">
                      {addressErrors.street}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr-details">Detalles</Label>
                  <Input
                    id="addr-details"
                    placeholder="Apto, piso, etc. (opcional)"
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAddress}
                    disabled={addAddressMutation.isPending}
                  >
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelAddAddress}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fecha de envío</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <RadioGroup value={selectedDate} onValueChange={setSelectedDate}>
              {shippingDates.map((date) => {
                const d = new Date(date + "T00:00:00")
                const dayName = format(d, "EEEE", { locale: es })
                const dateFormatted = format(d, "d 'de' MMMM", { locale: es })
                return (
                  <Label
                    key={date}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={date} />
                    <div className="grid gap-0.5">
                      <span className="text-sm font-medium capitalize">
                        {dayName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {dateFormatted}
                      </span>
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                Tu pedido llegará en {daysAway} día{daysAway !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name}{" "}
                  <span className="text-muted-foreground/70">
                    x {item.quantity}
                  </span>
                </span>
                <span className="tabular-nums">
                  {formatCop(item.lineTotal)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-1 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-semibold tabular-nums">
                {formatCop(cart.subtotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full"
          disabled={blocked}
          onClick={handlePlaceOrder}
        >
          {blocked ? "Procesando..." : "Pagar"}
        </Button>
      </div>
    </div>
  )
}
