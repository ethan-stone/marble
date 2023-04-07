import { createId } from "@paralleldrive/cuid2";

export function uid(args?: { prefix?: string }) {
  if (args?.prefix) return `${args.prefix}_${createId()}`;
  return createId();
}
