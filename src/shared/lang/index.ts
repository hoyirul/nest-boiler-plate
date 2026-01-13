import id from "./id.json";
import en from "./en.json";

const languages: Record<string, any> = { id, en };

// helper to get value from nested path
const getNested = (obj: any, path: string) => {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
};

export const getMessage = (
  lang: string = "id",
  path: string, 
  params?: Record<string, string | number> 
) => {
  let template = getNested(languages[lang], path) 
                 ?? getNested(languages["id"], path) 
                 ?? "";

  if (params) {
    for (const key in params) {
      const value = params[key];
      template = template.replaceAll(`:${key}`, String(value));
    }
  }

  return template;
};
