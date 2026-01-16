import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Thing-service API integration
 * Fetches customers from thing-service API
 */

interface ThingServiceCustomer {
  sysId: string;
  type: "customer";
  name: string;
  props?: {
    businessId?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    billingMethod?: string;
    billingAddress?: string;
    tags?: string[];
    active?: boolean;
    deleted?: boolean;
    [key: string]: any; // Other properties may vary
  };
}

interface ThingServiceResponse {
  items: ThingServiceCustomer[];
  duration: number;
}

interface ThingServiceFilter {
  active?: boolean;
  sysId?: string | number;
  sysIds?: (string | number)[];
  businessId?: string;
  deleted?: boolean;
}

/**
 * Fetch customers from thing-service API
 */
export const getCustomers = action({
  args: {
    filter: v.optional(v.object({
      active: v.optional(v.boolean()),
      sysId: v.optional(v.union(v.string(), v.number())),
      sysIds: v.optional(v.array(v.union(v.string(), v.number()))),
      businessId: v.optional(v.string()),
      deleted: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.THING_SERVICE_TOKEN;
    const tenantId = process.env.THING_SERVICE_TENANT_ID;
    const baseUrl = process.env.THING_SERVICE_BASE_URL || "https://api.ggjb.fi";

    if (!apiKey) {
      throw new Error(
        "THING_SERVICE_TOKEN ei ole määritelty Convex-ympäristössä. " +
        "Aseta se Convex Dashboardissa: Settings → Environment Variables"
      );
    }

    if (!tenantId) {
      throw new Error(
        "THING_SERVICE_TENANT_ID ei ole määritelty Convex-ympäristössä. " +
        "Aseta se Convex Dashboardissa: Settings → Environment Variables"
      );
    }

    const requestBody: {
      action: "get-customers";
      filter?: ThingServiceFilter;
    } = {
      action: "get-customers",
    };

    if (args.filter) {
      requestBody.filter = args.filter as ThingServiceFilter;
    }

    const response = await fetch(`${baseUrl}/v3/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "token-id-type": "tenant",
        "token-id": tenantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      
      // Provide helpful error messages for common issues
      if (response.status === 401) {
        throw new Error(
          `Thing-service API: 401 Unauthorized. ` +
          `Tarkista että THING_SERVICE_TOKEN ja THING_SERVICE_TENANT_ID ovat oikein Convex Dashboardissa. ` +
          `Tenant ID:n pitää vastata JWT tokenin sisältämää tenant-ID:tä. ` +
          `Virheilmoitus: ${errorText || "Unauthorized"}`
        );
      }
      
      throw new Error(
        `Thing-service API error: ${response.status} - ${errorText || "Unknown error"}`
      );
    }

    const data: ThingServiceResponse = await response.json();

    // Map Thing-service format to ExternalCustomer format
    return data.items.map((item) => {
      // Safely access props - handle cases where props might be undefined
      const props = item.props || {};
      
      return {
        sysId: item.sysId,
        name: item.name,
        businessId: props.businessId,
        contactPerson: props.contactPerson || item.name,
        email: props.email || "",
        phone: props.phone || "",
        address: props.address || "",
        billingMethod: (props.billingMethod as "email" | "e-invoice" | "mail") || "email",
        billingAddress: props.billingAddress,
        tags: props.tags || [],
        active: props.active ?? true,
        deleted: props.deleted ?? false,
        props: props, // Keep original props for reference
      };
    });
  },
});
