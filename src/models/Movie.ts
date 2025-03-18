export class Movie {
  private readonly _id: number;
  private _title: string;
  private _description: string | null;
  private _filePath: string | null;
  private readonly _userId: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(data: {
    id: number;
    title: string;
    description?: string | null;
    filePath?: string | null;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = data.id;
    this._title = data.title;
    this._description = data.description ?? null;
    this._filePath = data.filePath ?? null;
    this._userId = data.userId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters y setters (encapsulamiento)
  get id(): number {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get description(): string | null {
    return this._description;
  }

  set description(description: string | null) {
    this._description = description;
  }

  get filePath(): string | null {
    return this._filePath;
  }

  set filePath(filePath: string | null) {
    this._filePath = filePath;
  }

  get userId(): number {
    return this._userId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Método para convertir la instancia a un objeto plano
   * para que se pueda enviar a través de una API
   */
  toJSON() {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      filePath: this._filePath,
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Método estático para crear una nueva instancia de Movie desde un objeto plano
   */
  static fromJSON(data: any): Movie {
    return new Movie({
      id: data.id,
      title: data.title,
      description: data.description,
      filePath: data.filePath,
      userId: data.userId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
}
