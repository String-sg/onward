export interface Column<T> {
  /** The key in the data object */
  key: keyof T & string;
  /** The label to display in the header */
  label: string;
}
