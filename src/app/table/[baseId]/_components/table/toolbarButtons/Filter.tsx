type FilterCondition =
  | "is not empty"
  | "is empty"
  | "contains"
  | "not contains"
  | "equal to";

export type Filter = {
  id: string;
  columnId: string;
  condition: FilterCondition;
  value: string | number | null;
};

export type Condition = "or" | "and";
