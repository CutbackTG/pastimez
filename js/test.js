// test.js

// Sample data to mock your hobby clubs
const mockHobbyClubs = [
  { name: "Cornwall Chess Club", category: "Board Games", description: "A club for chess lovers", location: "Truro" },
  { name: "Kernow Photographers", category: "Photography", description: "Capture Cornwall!", location: "Falmouth" },
  { name: "Falmouth Coders", category: "Coding", description: "A space for devs", location: "Falmouth" }
];

// Function to filter clubs by keyword
function filterClubsByKeyword(clubs, keyword) {
  const term = keyword.toLowerCase();
  return clubs.filter(club =>
    club.name.toLowerCase().includes(term) ||
    club.description.toLowerCase().includes(term) ||
    club.category.toLowerCase().includes(term)
  );
}

// Function to filter clubs by category
function filterClubsByCategory(clubs, category) {
  return clubs.filter(club => club.category === category);
}

// Sample marker function
function createMarkerData(club) {
  return {
    position: { lat: 50.1, lng: -5.1 }, // mocked coordinates
    title: club.name,
    description: club.description
  };
}

describe('Club Filtering', () => {
  test('filters by keyword "chess"', () => {
    const result = filterClubsByKeyword(mockHobbyClubs, "chess");
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Cornwall Chess Club");
  });

  test('filters by category "Photography"', () => {
    const result = filterClubsByCategory(mockHobbyClubs, "Photography");
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Kernow Photographers");
  });

  test('returns empty when no match found', () => {
    const result = filterClubsByKeyword(mockHobbyClubs, "fishing");
    expect(result).toEqual([]);
  });
});

describe('Map Marker Data', () => {
  test('creates correct marker object', () => {
    const club = mockHobbyClubs[0];
    const marker = createMarkerData(club);
    expect(marker.title).toBe(club.name);
    expect(marker.description).toBe(club.description);
    expect(marker.position).toHaveProperty("lat");
    expect(marker.position).toHaveProperty("lng");
  });
});
