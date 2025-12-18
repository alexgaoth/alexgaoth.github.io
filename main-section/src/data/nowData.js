export const getNowData = async () => {
  let data;
  try {
    data = await fetchNowDataFromAPI("https://alexgaoth.com/profile.json");
  } catch (e) {
    data = {
      working: { "Error": "Failed to load working data" },
      consuming: { "Error": "Failed to load consuming data" },
      location: { "Error": "Failed to load location data" }
    };
  }
  
  return {
    title: "What I'm up to now",
    lastUpdated: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }),
    sections: [
      {
        title: "Currently Working On",
        content: data.working || { "Error": "No working data available" }
      },
      {
        title: "Currently Consuming",
        content: data.consuming || { "Error": "No consuming data available" }
      },
      {
        title: "Currently At",
        content: data.location || { "Error": "No location data available" }
      }
    ]
  };
};

export const fetchNowDataFromAPI = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the parsed JSON data directly
  } catch (error) {
    console.error("Error fetching now data:", error);
    throw error; // Re-throw the error so it can be caught in getNowData
  }
};