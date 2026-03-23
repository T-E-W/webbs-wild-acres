export const revalidate = 86400;

interface MarsReport {
  slug_id: string;
  report_title: string;
  report_date?: string;
  published_date?: string;
}

interface MarsDetail {
  report_date?: string;
  published_date?: string;
  commodity?: string;
  type?: string;
  grade?: string;
  high?: number | string;
  low?: number | string;
  mostly_high?: number | string;
  mostly_low?: number | string;
  avg_price?: number | string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const reportsRes = await fetch(
      "https://marsapi.ams.usda.gov/services/v1.2/reports?q=lamb&allSections=true",
      {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json" },
      }
    );

    if (!reportsRes.ok) {
      return Response.json(
        { error: true, message: `USDA API responded with ${reportsRes.status}` },
        { status: 200 }
      );
    }

    const reportsData = await reportsRes.json();
    const reports: MarsReport[] = Array.isArray(reportsData)
      ? reportsData
      : reportsData?.results ?? reportsData?.data ?? [];

    if (!reports.length) {
      return Response.json(
        { error: true, message: "No lamb reports found from USDA AMS." },
        { status: 200 }
      );
    }

    // Priority keywords for weekly national slaughter/feeder lamb reports
    const priority = [
      "national weekly",
      "feeder and slaughter",
      "slaughter lamb",
      "feeder lamb",
      "weekly lamb",
    ];

    let chosen: MarsReport | undefined;
    for (const kw of priority) {
      chosen = reports.find(
        (r) =>
          r.report_title?.toLowerCase().includes(kw) ||
          r.slug_id?.toLowerCase().includes(kw.replace(/ /g, "-"))
      );
      if (chosen) break;
    }

    // Fall back to first report that mentions "lamb"
    if (!chosen) {
      chosen = reports.find(
        (r) =>
          r.report_title?.toLowerCase().includes("lamb") ||
          r.slug_id?.toLowerCase().includes("lamb")
      );
    }

    if (!chosen) {
      return Response.json(
        { error: true, message: "Could not locate a lamb price report." },
        { status: 200 }
      );
    }

    const detailRes = await fetch(
      `https://marsapi.ams.usda.gov/services/v1.2/reports/${chosen.slug_id}?allSections=true`,
      {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json" },
      }
    );

    if (!detailRes.ok) {
      return Response.json(
        {
          error: true,
          message: `Could not fetch report detail (${detailRes.status}).`,
        },
        { status: 200 }
      );
    }

    const detailData = await detailRes.json();
    const rows: MarsDetail[] = Array.isArray(detailData)
      ? detailData
      : detailData?.results ?? detailData?.data ?? [];

    if (!rows.length) {
      return Response.json(
        { error: true, message: "Report detail returned no data." },
        { status: 200 }
      );
    }

    // Find the most useful price row — prefer "slaughter" lambs, cwt prices
    const slaughterRow =
      rows.find(
        (r) =>
          String(r.commodity ?? "").toLowerCase().includes("lamb") ||
          String(r.type ?? "").toLowerCase().includes("slaughter")
      ) ?? rows[0];

    const reportDate =
      slaughterRow.report_date ??
      slaughterRow.published_date ??
      chosen.report_date ??
      chosen.published_date ??
      null;

    const priceCwt =
      Number(slaughterRow.avg_price ?? slaughterRow.mostly_high ?? slaughterRow.high ?? 0) || null;

    return Response.json({
      error: false,
      reportTitle: chosen.report_title,
      slugId: chosen.slug_id,
      reportDate,
      priceCwt,
      high: slaughterRow.high !== undefined ? Number(slaughterRow.high) : null,
      low: slaughterRow.low !== undefined ? Number(slaughterRow.low) : null,
      mostlyHigh:
        slaughterRow.mostly_high !== undefined ? Number(slaughterRow.mostly_high) : null,
      mostlyLow:
        slaughterRow.mostly_low !== undefined ? Number(slaughterRow.mostly_low) : null,
      commodity: slaughterRow.commodity ?? null,
      grade: slaughterRow.grade ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: true, message: `Failed to fetch USDA data: ${message}` },
      { status: 200 }
    );
  }
}
