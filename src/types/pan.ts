export interface PANVerificationRequest {
  pan: string;
  name?: string;
  consent: string;
  reason: string;
}

export interface SetuPANResponse {
  data?: {
    aadhaar_seeding_status?: "LINKED" | "NOT_LINKED";
    category?:
      | "Individual"
      | "Company"
      | "Trust"
      | "Government"
      | "Firm"
      | "HUF";
    full_name?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
  message?: string;
  verification?: string;
  traceId?: string;
  error?: string;
}

export interface FormattedResponse {
  success: boolean;
  pan: string;
  name_match?: boolean | null;
  status: "valid" | "invalid" | "not_found" | "error";
  full_name?: string;
  category?: string;
  aadhaar_linked?: boolean;
  message?: string;
  error?: string;
}
