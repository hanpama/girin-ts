export function formatObjectInfo(obj: any): string {
  let name: string;
  let type: string;
  try {
    if (typeof obj === 'function') {
      name = obj.name || '[anonymous function]';
      type = typeof obj;
    } else {
      name = String(obj);
      type = obj && obj.constructor.name;
    }
    return `${name}<${type}>`;
  } catch (e) {
    return String(obj);
  }
}
