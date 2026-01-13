// Modules
export const MODULE = {
  GENERAL: "GE",
  AUTH: "AU",
  USER: "US",
  ROLE: "RO",
  PERMISSION: "PE",
  EXAMPLE: "EX",
  PRODUCT: "PR",
  CONNECTION: "CN",
  TEST: "TE",
  DIVISION: "DI",
  DEPARTMENT: "DE",
  POSITION: "PO",
  FEATURE: "FE",
  APPROVAL: "AP",
  STATUS: "ST",
} as const;

// Response Type
export const RESP_TYPE = {
  SUCCESS: "S",
  ERROR: "E",
} as const;

// Response Status
export const RESP_STATUS = {
  // General Success
  OK: "OK",
  CREATED: "CR",
  ACCEPTED: "AC",
  NO_CONTENT: "NC",
  PARTIAL_CONTENT: "PC",
  MULTI_STATUS: "MS",
  ALREADY_REPORTED: "AR",
  IM_USED: "IU",

  // General Errors
  GENERAL: "GE",
  VALIDATION: "VA",
  UNAUTHORIZED: "UN",
  FORBIDDEN: "FO",
  NOT_FOUND: "NF",
  CONFLICT: "CO",
  INTERNAL_SERVER_ERROR: "IS",
  SERVICE_UNAVAILABLE: "SU",
  TIMEOUT: "TO",
  RATE_LIMIT: "RL",
  BAD_REQUEST: "BR",
  UNPROCESSABLE_ENTITY: "UE",
  PAYLOAD_TOO_LARGE: "PL",
  UNSUPPORTED_MEDIA_TYPE: "UM",
  TOO_MANY_REQUESTS: "TR",
  NOT_IMPLEMENTED: "NI",
  BAD_GATEWAY: "BG",
  GATEWAY_TIMEOUT: "GT",
  NETWORK_AUTHENTICATION_REQUIRED: "NA",
  INSUFFICIENT_STORAGE: "IT",
  LOOP_DETECTED: "LD",
  BANDWIDTH_LIMIT_EXCEEDED: "BE",
  NOT_EXTENDED: "NE",
  NETWORK_READ_TIMEOUT_ERROR: "NR",
  NETWORK_CONNECT_TIMEOUT_ERROR: "NC",
  INCOMPLETE_PROFILE: "IP",
} as const;

// Make Response Code
export const makeCode = (
  type: string,
  module: string,
  httpCode: number,
  status: string
) => `${type}-${module}${httpCode}${status}`;
