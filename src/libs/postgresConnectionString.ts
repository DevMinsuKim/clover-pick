/** Preserve pg 8's certificate validation when using its legacy SSL aliases. */
export function postgresConnectionString(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    // Leave parsing errors to pg, which redacts credentials from its error input.
    return connectionString;
  }

  const mode = url.searchParams.get("sslmode");
  if (
    url.searchParams.get("uselibpqcompat") !== "true" &&
    (mode === "prefer" || mode === "require" || mode === "verify-ca")
  ) {
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  }

  return connectionString;
}
