export abstract class BaseEntity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(id: string, props: T) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }

  public toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = { id: this._id };
    const prototype = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(prototype);

    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor.get && key !== 'id') {
        result[key] = (this as Record<string, unknown>)[key];
      }
    }

    return result;
  }
}
