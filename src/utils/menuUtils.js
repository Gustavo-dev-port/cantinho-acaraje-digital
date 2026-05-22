export function getAllMenuItems(menuData) {
  return Object.entries(menuData)
    .filter(([category]) => category !== "Destaques")
    .flatMap(([, items]) => items);
}

export function getItemsByIds(menuData, ids) {
  const allItems = getAllMenuItems(menuData);

  return ids
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);
}

export function validateUniqueMenuIds(menuData) {
  const ids = new Map();
  const duplicatedIds = [];

  Object.entries(menuData).forEach(([category, items]) => {
    if (category === "Destaques") return;

    items.forEach((item) => {
      if (ids.has(item.id)) {
        duplicatedIds.push({
          id: item.id,
          firstCategory: ids.get(item.id),
          duplicatedCategory: category,
          itemName: item.name,
        });
      } else {
        ids.set(item.id, category);
      }
    });
  });

  return duplicatedIds;
}
