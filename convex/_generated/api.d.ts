/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as communicationTasks from "../communicationTasks.js";
import type * as costEntries from "../costEntries.js";
import type * as files from "../files.js";
import type * as gemini from "../gemini.js";
import type * as messages from "../messages.js";
import type * as pricingTemplates from "../pricingTemplates.js";
import type * as quotations from "../quotations.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  communicationTasks: typeof communicationTasks;
  costEntries: typeof costEntries;
  files: typeof files;
  gemini: typeof gemini;
  messages: typeof messages;
  pricingTemplates: typeof pricingTemplates;
  quotations: typeof quotations;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
