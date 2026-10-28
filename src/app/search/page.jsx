import { redirect } from "next/navigation";

export default async function SearchQueryParamRedirect({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || params?.query || "";
  if (typeof q === "string" && q.trim()) {
    redirect(`/search/${encodeURIComponent(q.trim())}`);
  }
  redirect("/");
}
