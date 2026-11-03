// Shared by the rows, the column labels and the loading skeleton, so they
// stay aligned. Below xl the table collapses into stacked cards; xl shows
// the full columns.
const xlColumns =
  "xl:grid-cols-[40px_88px_minmax(220px,1.6fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px_196px] xl:items-center xl:gap-5"

export const columns = `grid grid-cols-[24px_1fr] items-center gap-4 ${xlColumns}`

export const rowLayout = `grid grid-cols-[24px_72px_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[24px_88px_1fr] ${xlColumns}`
