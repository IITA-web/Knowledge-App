const unstructuredData = [
  { name: "Pizza", category: "Main dishes" },
  { name: "Burger", category: "Main dishes" },
  { name: "Risotto", category: "Main dishes" },
  { name: "French Fries", category: "Sides" },
  { name: "Onion Rings", category: "Sides" },
  { name: "Fried Shrimps", category: "Sides" },
  { name: "Water", category: "Drinks" },
  { name: "Coke", category: "Drinks" },
  { name: "Beer", category: "Drinks" },
  { name: "Cheese Cake", category: "Desserts" },
  { name: "Ice Cream", category: "Desserts" },
];
const groupedData = Object.values(
  unstructuredData.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = { title: item.category, data: [] };
    }
    acc[item.category].data.push(item.name);
    return acc;
  }, {})
);

console.log(groupedData);
