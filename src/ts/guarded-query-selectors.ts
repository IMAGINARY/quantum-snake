export function guardedQuerySelector<T extends Element>(
  type: new (...args: unknown[]) => T,
  selector: string,
  elem: Element | Document = document,
): T {
  const result = elem.querySelector(selector);
  if (result === null) {
    throw new Error(`No element found matching selector ${selector}.`);
  }
  if (!(result instanceof type)) {
    throw new Error(
      `Element matching selector ${selector} has the wrong type.`,
    );
  }
  return result;
}

export function guardedQuerySelectorAll<T extends Element>(
  type: new (...args: unknown[]) => T,
  selector: string,
  elem: Element | Document = document,
): NodeListOf<T> {
  const results = elem.querySelectorAll(selector);
  results.forEach((result) => {
    if (!(result instanceof type)) {
      throw new Error(
        `An element matching selector ${selector} has the wrong type.`,
      );
    }
  });

  return results as NodeListOf<T>;
}
