export interface BillingContext {
  success: boolean;
}

export interface BillingAuthenticateOptions {
  plans: string[];
  onFailure: (error: any) => Promise<void>;
  isTest?: boolean;
}

export interface RequestBillingOptions {
  plan: string;
  isTest?: boolean;
  returnUrl?: string;
}
