import { PageHeader } from "../page-header"

export function OverviewHeader({
  actions,
}: {
  /** the range picker; left out while loading or after an error */
  actions?: React.ReactNode
}) {
  return (
    <PageHeader
      crumbs={["Admin", "Overview"]}
      eyebrow="Sales, stock and customers at a glance"
      title="Overview"
      actions={actions}
    />
  )
}
