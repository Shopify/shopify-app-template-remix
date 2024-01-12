const transactionStatusCode = {
  "Y": "Authentication/ Account Verification Successful",
  "N": "Not Authenticated /Account Not Verified; Transaction denied",
  "U": "Authentication/ Account Verification Could Not Be Performed; Technical or other problem, as indicated in ARes or RReq",
  "A": "Attempts Processing Performed; Not Authenticated/Verified , but a proof of attempted authentication/verification is provided",
  "R": "Authentication/ Account Verification Rejected; Issuer is rejecting authentication/verification and request that authorisation not be attempted",
  "I": "Informational Only; 3DS Requestor challenge preference acknowledged.",
}
  
const simulationChoice = {
  "AuthenticationData": "authentication_data",
  "PartnerError": "partner_error",
}

const flow = {
  "CHALLENGE" : "Challenge",
  "UNKNOWN" : "Unknown",
}

const version = {
  "V1_0": "1.0",
  "V2_1": "2.1",
  "V2_2": "2.2",
  "V2_3": "2.3",
  "Unknown": "unknown",
}

const chargebackLiability = {
  "MERCHANT": "Merchant",
  "UNKNOWN": "Unknown",
}

const partnerError = {
  "PROCESSING_ERROR": "Processing error",
}

export default {
  transactionStatusCode,
  simulationChoice,
  flow,
  version,
  chargebackLiability,
  partnerError
}