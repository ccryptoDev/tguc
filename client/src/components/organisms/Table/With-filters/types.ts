export type IfiltersInit = {
  name: string;
  active: boolean;
  status: string | string[];
}[];

export type IProps = {
  filtersInit?: IfiltersInit;
  activeFilter?: Function;
  initStatus?: string | string[];
  api: Function;
  rows: any;
  thead: any;
};
