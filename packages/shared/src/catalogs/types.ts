export interface Country {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface UnitMeasure {
  code: string;
  name: string;
}

export interface Department {
  code: string;
  name: string;
}

export interface Municipality {
  code: string;
  name: string;
  department: Department;
}
