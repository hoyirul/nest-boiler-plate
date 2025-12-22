import id from "./id.json";
import en from "./en.json";

const languages: Record<string, any> = { id, en };

// helper to get value from nested path
const getNested = (obj: any, path: string) => {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
};

export const getMessage = (
  lang: string = "id",
  path: string // e.g: "api.modules.user.fetched_all"
) => {
  return getNested(languages[lang], path) ?? getNested(languages["id"], path) ?? "";
};
