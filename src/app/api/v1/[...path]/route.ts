import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:4000/api/v1";

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const targetUrl = new URL(
    `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`,
  );

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", req.nextUrl.host);

  const body = ["POST", "PATCH", "PUT", "DELETE"].includes(req.method)
    ? await req.arrayBuffer()
    : undefined;

  try {
    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Backend unavailable";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: `Unable to reach Express backend at ${BACKEND_URL}: ${message}`,
        },
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
