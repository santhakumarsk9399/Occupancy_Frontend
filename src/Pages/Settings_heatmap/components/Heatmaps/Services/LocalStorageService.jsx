const KEY = "heatmap_zones";

export const getZones = () => {
    return JSON.parse(localStorage.getItem(KEY)) || [];
};

export const saveZone = (zone) => {
    const zones = getZones();
    localStorage.setItem(KEY, JSON.stringify([...zones, zone]));
};

export const updateZone = (updatedZone) => {
    const zones = getZones().map((z) =>
        z.id === updatedZone.id ? updatedZone : z
    );
    localStorage.setItem(KEY, JSON.stringify(zones));
};

export const deleteZone = (id) => {
    const zones = getZones().filter((z) => z.id !== id);
    localStorage.setItem(KEY, JSON.stringify(zones));
};