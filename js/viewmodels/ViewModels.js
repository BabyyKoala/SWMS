export function buildKPIModel(manager) {
  const total = manager.getTotalWeight();
  const itemCount = manager.getItemCount();
  const organik = manager.getWeightByCategory()["organik"] || 0;
  return {
    total,
    itemCount,
    organikPercent: total ? Math.round((organik / total) * 100) : 0,
  };
}

export function buildChartModel(manager) {
  const byCat = manager.getWeightByCategory();
  const labels = Object.keys(byCat);
  const data = labels.map((k) => byCat[k]);
  return { labels, data };
}
