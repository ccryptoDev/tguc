export const filterExistingOptions = (
  tableItems: any[] = [],
  options: any[] = []
) => {
  if (Array.isArray(tableItems) && Array.isArray(options)) {
    return options.filter(
      (opt: any) => !tableItems.some((item: any) => item.id === opt.id)
    );
  }
  return [];
};
