import { UsersHeader } from "@/components/dashboard/users/users-header"
import { UsersLoading } from "@/components/dashboard/users/users-states"

export default function Loading() {
  return (
    <>
      <UsersHeader summary={null} />
      <UsersLoading />
    </>
  )
}
