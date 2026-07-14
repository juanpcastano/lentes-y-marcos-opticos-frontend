interface ResultsCountProps {
  visible: number
  total: number
}

export function ResultsCount({ visible, total }: ResultsCountProps) {
  return (
    <p className="text-sm text-muted-foreground">
      Mostrando {visible} de {total} resultados
    </p>
  )
}
