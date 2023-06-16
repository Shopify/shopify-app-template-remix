import crypto from "crypto";

import { setCrypto } from "@shopify/shopify-api/runtime";

setCrypto(crypto as any);
