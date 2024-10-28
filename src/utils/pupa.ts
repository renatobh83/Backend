/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */

import { getHours } from "date-fns";

// Funções de escape e unescape para HTML
const _htmlEscape = (string: string): string =>
  string
    .replace(/&/g, "&amp;") // Deve ocorrer primeiro para não escapar caracteres já escapados
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const _htmlUnescape = (htmlString: string): string =>
  htmlString
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&"); // Deve ocorrer por último para evitar unescape incorreto

export function htmlEscape(
  strings: TemplateStringsArray | string,
  ...values: any[]
): string {
  if (typeof strings === "string") {
    return _htmlEscape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlEscape(String(value)) + strings[index + 1];
  }

  return output;
}

export function htmlUnescape(
  strings: TemplateStringsArray | string,
  ...values: any[]
): string {
  if (typeof strings === "string") {
    return _htmlUnescape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlUnescape(String(value)) + strings[index + 1];
  }

  return output;
}

export class MissingValueError extends Error {
  key: string | undefined;

  constructor(key?: string) {
    super(
      `Missing a value for ${key ? `the placeholder: ${key}` : "a placeholder"}`
    );
    this.name = "MissingValueError";
    this.key = key;
  }
}

export const pupa = function pupa(
  template: string,
  data: Record<string, any>,
  options: {
    ignoreMissing?: boolean;
    transform?: ({ value, key }: { value: any; key: string }) => any;
  } = {}
): string {
  const { ignoreMissing = true, transform = ({ value }) => value } = options;

  const hours = getHours(new Date());
  const getGreeting = (): string => {
    if (hours >= 6 && hours <= 11) {
      return "Bom dia!";
    }
    if (hours > 11 && hours <= 17) {
      return "Boa Tarde!";
    }
    if (hours > 17 && hours <= 23) {
      return "Boa Noite!";
    }
    return "Olá!";
  };

  data = { ...data, greeting: getGreeting() };

  const replace = (placeholder: string, key: string): string => {
    let value: any = data;
    for (const property of key.split(".")) {
      value = value ? value[property] : undefined;
    }

    const transformedValue = transform({ value, key });
    if (transformedValue === undefined) {
      if (ignoreMissing) {
        return "";
      }

      throw new MissingValueError(key);
    }

    return String(transformedValue);
  };

  const composeHtmlEscape =
    (replacer: (...args: any[]) => string) =>
    (...args: any[]) =>
      htmlEscape(replacer(...args));

  // Regex para identificar {{ }} e {}
  const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;
  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

  if (doubleBraceRegex.test(template)) {
    const regex = new RegExp(doubleBraceRegex.source, doubleBraceRegex.flags); // Clonando regex para evitar problemas com flags
    template = template.replace(regex, composeHtmlEscape(replace));
  }

  return template.replace(braceRegex, replace);
};
