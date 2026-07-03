import { Prisma } from "@/app/generated/prisma/client";
import { getTenantId } from "./context";
import { scopeQueryArgs } from "./scope";
import { TENANT_SCOPED_MODELS } from "./scoped-models";

export const tenantScopingExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: "tenant-scoping",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }
          const scopedArgs = scopeQueryArgs(
            model,
            operation,
            args,
            getTenantId(),
          );
          return query(scopedArgs);
        },
      },
    },
  }),
);
