export function inferCategory(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/\b(teacher|faculty|tutor|professor|educator|trainer)\b/.test(text)) return "Teacher";
  if (/\b(cashier|teller|billing|pos)\b/.test(text)) return "Cashier";
  if (/\b(government|ssc|upsc|railway|rrb|public sector)\b/.test(text)) return "Government";
  if (/\b(engineer|developer|software|civil|mechanical|electrical|data|ai|ml)\b/.test(text)) return "Engineer";
  if (/\b(human resource|hr|recruiter|talent)\b/.test(text)) return "HR";
  if (/\b(sales|business development|account executive)\b/.test(text)) return "Sales";
  if (/\b(marketing|seo|content|campaign|brand)\b/.test(text)) return "Marketing";
  return "IT";
}

export function inferExperience(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/(fresher|graduate|entry level|intern|trainee)/.test(text)) return "Fresher";
  if (/(5\+|5 years|senior|lead|manager|principal)/.test(text)) return "5+ years";
  if (/(3-5|3 to 5|4 years)/.test(text)) return "3-5 years";
  return "1-3 years";
}

export function inferJobType(text = "") {
  const value = text.toLowerCase();
  if (/part.time/.test(value)) return "Part-time";
  if (/contract/.test(value)) return "Contract";
  if (/freelance/.test(value)) return "Freelance";
  return "Full-time";
}

export function cleanHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function cityStateFromLocation(value = "") {
  let location = cleanHtml(value) || "Remote";
  const lower = location.toLowerCase();
  
  if (lower.includes("bangalore") || lower.includes("bengaluru")) location = "Bengaluru";
  if (lower.includes("gurgaon") || lower.includes("gurugram")) location = "Gurugram";
  if (lower.includes("bombay") || lower.includes("mumbai")) location = "Mumbai";
  if (lower.includes("madras") || lower.includes("chennai")) location = "Chennai";
  if (lower.includes("calcutta") || lower.includes("kolkata")) location = "Kolkata";

  const first = location.split(",")[0]?.trim() || "Remote";
  if (lower.includes("india")) return { location: first, state: "India" };
  if (/(worldwide|anywhere|global)/i.test(lower)) return { location: first, state: "Global remote" };
  if (lower.includes("remote")) return { location: "Remote", state: "Pan India" };
  return { location: first, state: location.split(",").slice(1).join(",").trim() || "Location on source" };
}

export function daysAgo(dateValue) {
  if (!dateValue) return 0;
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}
