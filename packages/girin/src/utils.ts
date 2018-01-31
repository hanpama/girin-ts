export function isSubClassOf(cls: Function, superClass: Function) {
  return (cls === superClass) || (cls.prototype instanceof superClass);
}
