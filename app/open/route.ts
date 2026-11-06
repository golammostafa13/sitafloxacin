import { openRedirect } from "@/lib/open";

/** The address printed as the QR code on the Sitamax card. It never renders. */
export async function GET(req: Request) {
  return openRedirect(req, "/");
}
