// Mock data for equipment rental app
let mockEquipmentData = [
  {
    id: 1,
    name: 'Nikon D3500',
    category: 'Kamere',
    description: 'DSLR kamera za početnike, 24.2MP, AF-P DX NIKKOR objektiv',
    available: true,
    location: 'Studio A',
    imageUrl: null,
    borrower: null,
    owner: {
      name: 'Prof. Marko Novak',
      role: 'profesor',
      email: 'marko.novak@apu.hr',
    },
  },
  {
    id: 2,
    name: 'Neewer Stativ',
    category: 'Stativni',
    description: 'Aluminijski stativ, max visina 180cm, noseći kapacitet 5kg',
    available: true,
    location: 'Oprema sala',
    imageUrl: null,
    borrower: null,
    owner: null, // University equipment
  },
  {
    id: 3,
    name: 'Wacom CTL-472',
    category: 'Tableti',
    description: 'Grafički tablet za digitalno crtanje, USB povezivanje',
    available: false,
    location: 'Rezerviran',
    imageUrl: null,
    borrower: {
      name: 'Ana Marković',
      role: 'student',
      email: 'ana.markovic@apu.hr',
      borrowedUntil: '2024-09-25',
    },
    owner: {
      name: 'Prof. Ivo Kovač',
      role: 'profesor',
      email: 'ivo.kovac@apu.hr',
    },
  },
  {
    id: 4,
    name: 'Nikon D5600',
    category: 'Kamere',
    description: 'DSLR kamera s Wi-Fi, 24.2MP, okretni LCD ekran',
    available: true,
    location: 'Studio B',
    imageUrl: null,
    borrower: null,
    owner: null, // University equipment
  },
  {
    id: 5,
    name: 'Fotografski studio',
    category: 'Studijski',
    description: 'Kompletni fotografski studio s rasvjetom i pozadinom',
    available: true,
    location: 'Studio C',
    imageUrl: null,
    borrower: null,
    owner: {
      name: 'Prof. Milan Horvat',
      role: 'profesor',
      email: 'milan.horvat@apu.hr',
    },
  },
  {
    id: 6,
    name: 'MacBook Pro',
    category: 'Računala',
    description: '13" MacBook Pro, M1 chip, 8GB RAM, idealan za video montažu',
    available: false,
    location: 'Rezerviran',
    imageUrl: null,
    borrower: {
      name: 'Prof. Marko Petrović',
      role: 'profesor',
      email: 'marko.petrovic@apu.hr',
      borrowedUntil: '2024-09-22',
    },
    owner: {
      name: 'Prof. Sandra Miletić',
      role: 'profesor',
      email: 'sandra.miletic@apu.hr',
    },
  },
  {
    id: 7,
    name: 'Canon EOS 2000D',
    category: 'Kamere',
    description: 'Entry-level DSLR, 24.1MP, Wi-Fi povezivanje',
    available: false,
    location: 'Rezerviran',
    imageUrl: null,
    borrower: {
      name: 'Petra Novak',
      role: 'student',
      email: 'petra.novak@apu.hr',
      borrowedUntil: '2024-09-20',
    },
    owner: {
      name: 'Prof. Tomislav Babić',
      role: 'profesor',
      email: 'tomislav.babic@apu.hr',
    },
  },
  {
    id: 8,
    name: 'iPad Pro 12.9"',
    category: 'Tableti',
    description: 'Profesionalni tablet za dizajn, s Apple Pencil podrškom',
    available: true,
    location: 'Grafička sala',
    imageUrl: null,
    borrower: null,
    owner: null, // University equipment
  },
];

export const mockEquipment = mockEquipmentData;

// Function to add new equipment
export const addEquipment = (equipment) => {
  mockEquipmentData.push(equipment);
  return equipment;
};

// Function to update equipment
export const updateEquipment = (id, updates) => {
  const index = mockEquipmentData.findIndex(item => item.id === id);
  if (index !== -1) {
    mockEquipmentData[index] = { ...mockEquipmentData[index], ...updates };
    return mockEquipmentData[index];
  }
  return null;
};

// Function to delete equipment
export const deleteEquipment = (id) => {
  const index = mockEquipmentData.findIndex(item => item.id === id);
  if (index !== -1) {
    return mockEquipmentData.splice(index, 1)[0];
  }
  return null;
};

export const mockCategories = [
  { id: 1, name: 'Kamere', icon: 'camera', count: 15 },
  { id: 2, name: 'Stativni', icon: 'camera-outline', count: 8 },
  { id: 3, name: 'Tableti', icon: 'tablet-portrait', count: 12 },
  { id: 4, name: 'Studijski', icon: 'business', count: 5 },
  { id: 5, name: 'Računala', icon: 'laptop', count: 10 },
  { id: 6, name: 'Audio', icon: 'headset', count: 7 },
];

export const mockBookings = [
  {
    id: 1,
    equipmentId: 3,
    equipmentName: 'Wacom CTL-472',
    studentName: 'Ana Studenta',
    startDate: '2024-09-20',
    endDate: '2024-09-25',
    status: 'active',
  },
  {
    id: 2,
    equipmentId: 6,
    equipmentName: 'MacBook Pro',
    studentName: 'Marko Student',
    startDate: '2024-09-18',
    endDate: '2024-09-22',
    status: 'active',
  },
];