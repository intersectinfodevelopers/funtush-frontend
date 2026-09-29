import { redirect } from "next/navigation";

// Categories are managed on a single page now.
export default function Page() {
  redirect("/dashboard/categories");
}
