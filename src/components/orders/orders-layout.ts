// Shared by the rows, the column labels and the loading skeleton, so they
// stay aligned. Below xl each order is a stacked card; xl shows columns.
const xlColumns =
  "xl:grid-cols-[88px_minmax(220px,1.6fr)_minmax(140px,1fr)_minmax(140px,1fr)_96px_150px_120px] xl:items-center xl:gap-5"

export const columns = `hidden ${xlColumns} xl:grid`

export const rowLayout = `grid grid-cols-[72px_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[88px_1fr] ${xlColumns}`
