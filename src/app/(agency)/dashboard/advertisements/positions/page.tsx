import { redirect } from "next/navigation";

// Slot availability is shown on the advertisements page itself.
export default function Page() {
  redirect("/dashboard/advertisements");
}
