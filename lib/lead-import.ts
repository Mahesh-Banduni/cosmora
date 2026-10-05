/**
 * CSV parsing for lead imports.
 *
 * Hand-rolled rather than pulling in a parser library: this keeps the
 * server-only import graph free of UMD bundles that break the bundler.
 */

export type ParsedLeadRow = {
  companyName: string;
  domain: string | null;
  website: string | null;
  industry: string | null;
  description: string | null;
  employeeCount: number | null;
  revenueMin: number | null;
  revenueMax: number | null;
  revenueCurrency: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  technologies: string[];
  keywords: string[];
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
};

export type RowIssue = {
  row: number;
  field: string;
  message: string;
};

export type ParsedLeadFile = {
  rows: ParsedLeadRow[];
  issues: RowIssue[];
  totalRows: number;
};

/** Common aliases so real-world exports import without renaming columns. */
const COLUMN_ALIASES: Record<keyof ParsedLeadRow, string[]> = {
  companyName: [
    "company",
    "company name",
    "company_name",
    "organization",
    "organisation",
    "account",
  ],
  domain: ["domain", "website domain", "company domain", "url"],
  website: ["website", "site", "web site"],
  industry: ["industry", "sector", "vertical"],
  description: ["description", "about", "company description", "summary"],
  employeeCount: [
    "employees",
    "employee count",
    "size",
    "company size",
    "headcount",
    "no of employees",
  ],
  revenueMin: ["revenue min", "min revenue", "revenue", "annual revenue"],
  revenueMax: ["revenue max", "max revenue"],
  revenueCurrency: ["currency", "revenue currency"],
  country: ["country", "country name"],
  state: ["state", "region", "province"],
  city: ["city", "town", "location"],
  technologies: ["technologies", "tech", "tech stack", "technology"],
  keywords: ["keywords", "keyword", "tags"],
  firstName: ["first name", "firstname", "first_name", "given name"],
  lastName: ["last name", "lastname", "last_name", "surname", "family name"],
  jobTitle: ["job title", "title", "role", "position", "designation"],
  department: ["department", "team"],
  email: ["email", "e-mail", "email address", "work email", "contact email"],
  phone: ["phone", "telephone", "mobile", "phone number", "contact number"],
  linkedinUrl: ["linkedin", "linkedin url", "linkedin profile"],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Splits one CSV record, honouring quoted fields and escaped quotes.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function parseCsv(fileContent: string): { header: string[]; rows: string[][] } {
  const lines = fileContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) return { header: [], rows: [] };

  const header = splitCsvLine(lines[0]).map((cell) => cell.trim());
  const rows = lines.slice(1).map(splitCsvLine);

  return { header, rows };
}

function mapRow(
  cells: string[],
  headerMap: Map<string, number>
): ParsedLeadRow {
  const get = (field: keyof ParsedLeadRow): string | null => {
    for (const alias of COLUMN_ALIASES[field]) {
      const index = headerMap.get(alias);
      if (index === undefined) continue;

      const value = cells[index];
      if (value !== undefined && value.trim() !== "") {
        return value.trim();
      }
    }
    return null;
  };

  const splitList = (value: string | null): string[] =>
    value
      ? value
          .split(/[;|,]/)
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];

  const toNumber = (value: string | null): number | null => {
    if (!value) return null;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    companyName: get("companyName") ?? "",
    domain: get("domain"),
    website: get("website"),
    industry: get("industry"),
    description: get("description"),
    employeeCount: toNumber(get("employeeCount")),
    revenueMin: toNumber(get("revenueMin")),
    revenueMax: toNumber(get("revenueMax")),
    revenueCurrency: get("revenueCurrency"),
    country: get("country"),
    state: get("state"),
    city: get("city"),
    technologies: splitList(get("technologies")),
    keywords: splitList(get("keywords")),
    firstName: get("firstName"),
    lastName: get("lastName"),
    jobTitle: get("jobTitle"),
    department: get("department"),
    email: get("email"),
    phone: get("phone"),
    linkedinUrl: get("linkedinUrl"),
  };
}

function validateRow(row: ParsedLeadRow, index: number): RowIssue[] {
  const issues: RowIssue[] = [];
  const rowNumber = index + 1;

  if (!row.companyName.trim()) {
    issues.push({
      row: rowNumber,
      field: "companyName",
      message: "Company name is required.",
    });
  }

  if (row.email && !EMAIL_PATTERN.test(row.email)) {
    issues.push({
      row: rowNumber,
      field: "email",
      message: `"${row.email}" is not a valid email address.`,
    });
  }

  if (row.linkedinUrl && !/^https?:\/\//i.test(row.linkedinUrl)) {
    issues.push({
      row: rowNumber,
      field: "linkedinUrl",
      message: "LinkedIn URL must start with http:// or https://.",
    });
  }

  if (row.employeeCount !== null && row.employeeCount < 0) {
    issues.push({
      row: rowNumber,
      field: "employeeCount",
      message: "Employee count cannot be negative.",
    });
  }

  if (
    row.revenueMin !== null &&
    row.revenueMax !== null &&
    row.revenueMin > row.revenueMax
  ) {
    issues.push({
      row: rowNumber,
      field: "revenue",
      message: "Minimum revenue is greater than maximum revenue.",
    });
  }

  return issues;
}

/**
 * Parses a CSV file into lead rows.
 *
 * Invalid rows are reported rather than aborting the import, so the caller
 * can decide per row whether to skip or reject it.
 */
export function parseLeadFile(fileContent: string): ParsedLeadFile {
  const { header, rows } = parseCsv(fileContent);

  if (header.length === 0) {
    return { rows: [], issues: [], totalRows: 0 };
  }

  const headerMap = new Map<string, number>();
  header.forEach((cell, index) => headerMap.set(normalizeHeader(cell), index));

  const issues: RowIssue[] = [];
  const parsedRows: ParsedLeadRow[] = [];

  rows.forEach((cells, index) => {
    if (cells.every((cell) => cell.trim() === "")) return;

    const parsed = mapRow(cells, headerMap);
    issues.push(...validateRow(parsed, index));
    parsedRows.push(parsed);
  });

  return { rows: parsedRows, issues, totalRows: parsedRows.length };
}

export const LEAD_IMPORT_COLUMNS = [
  { key: "companyName", label: "Company Name", required: true },
  { key: "industry", label: "Industry", required: false },
  { key: "employeeCount", label: "Employees", required: false },
  { key: "revenueMin", label: "Min Revenue", required: false },
  { key: "revenueMax", label: "Max Revenue", required: false },
  { key: "country", label: "Country", required: false },
  { key: "state", label: "State / Region", required: false },
  { key: "city", label: "City", required: false },
  { key: "technologies", label: "Technologies", required: false },
  { key: "firstName", label: "First Name", required: false },
  { key: "lastName", label: "Last Name", required: false },
  { key: "jobTitle", label: "Job Title", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "linkedinUrl", label: "LinkedIn URL", required: false },
] as const;