import { useState } from "react"
import { ImportWizard } from "#/components/admin/integration/import-wizard"
import { SyncRunsPanel } from "#/components/admin/integration/sync-runs-panel"
import { SyncWizard } from "#/components/admin/integration/sync-wizard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"

/** Integración con Softix: sincronización guiada y revisión de registros. */
export function IntegrationPage() {
  const [tab, setTab] = useState("import")

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Integración</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Softix</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Softix es la fuente de verdad para el catálogo, el stock y los
          precios.
        </p>
      </header>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="import">Importación</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
        </TabsList>
        <TabsContent value="import" className="mt-4">
          <ImportWizard onViewLogs={() => setTab("logs")} />
        </TabsContent>
        <TabsContent value="sync" className="mt-4">
          <SyncWizard onViewLogs={() => setTab("logs")} />
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <SyncRunsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
