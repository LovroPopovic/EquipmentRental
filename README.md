# APU Equipment Rental - React Native App

React Native mobilna aplikacija za iznajmljivanje univerzitetske opreme sa AAI@EduHr autentifikacijom.

## 📋 Pregled

Mobilna aplikacija omogućava studentima da pretražuju i rezervišu opremu, dok osoblje može upravljati inventarom i odobravati rezervacije. Aplikacija se integriše sa hrvaskim akademskim federativnim identitetom (AAI@EduHr) za sigurnu autentifikaciju.

## 🏗️ Arhitektura

### Tehnički Stack
- **Framework**: React Native sa Expo
- **Navigacija**: React Navigation v6
- **State Management**: React Context + Hooks
- **Styling**: NativeWind (Tailwind CSS)
- **Autentifikacija**: AAI@EduHr OIDC + Expo AuthSession
- **Slike**: Expo Image + ImagePicker
- **Tema**: Light/Dark mode podrška

### Struktura projekta
```
src/
├── components/          # Reusable komponente
├── screens/            # Screen komponente
│   ├── main/          # Student screens
│   └── staff/         # Staff screens
├── navigation/        # Navigation setup
├── services/          # API i auth servisi
├── context/           # React Context providers
├── hooks/             # Custom hooks
└── constants/         # Konstante i konfiguracija
```

## 📱 Funkcionalnosti

### Student aplikacija (5 glavnih ekrana)
- **Home**: Pregled dostupne opreme sa naprednim search/filter
- **Search**: Detaljno pretraživanje sa kategorijama i filtrima
- **Equipment Detail**: Detaljni prikaz opreme sa mogućnošću rezervacije
- **Bookings**: Lične rezervacije i njihov status
- **Profile**: Profil korisnika sa theme toggle

### Staff aplikacija (7+ ekrana)
- **Dashboard**: Pregled statistika i pending zahteva
- **Equipment Management**: CRUD operacije za opremu
- **Add Equipment**: Dodavanje nove opreme sa slikama
- **Student Management**: Pregled studenata i njihovih rezervacija
- **Equipment History**: Istorija korišćenja opreme
- **Booking Approval**: Odobravanje/odbacivanje rezervacija
- **Profile**: Staff profil

### Ključne funkcionalnosti
- AAI@EduHr autentifikacija sa role detection
- Upload slika za opremu (camera/gallery)
- Horizontalno skrolovanje slika u equipment detaljima
- Real-time refresh nakon approve/reject akcija
- Formatiranje datuma i korisničkih imena
- Mock autentifikacija za development
- Light/Dark theme support

## 🚀 Lokalna konfiguracija

### Preduslov
```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0
```

### Instalacija

1. **Kloniraj i instaliraj zavisnosti**
```bash
cd EquipmentRental
npm install
```

2. **Instaliraj dodatne pakete**
```bash
npx expo install expo-image expo-image-picker expo-auth-session expo-web-browser
```

3. **Konfiguracija**

Uredi `src/services/authConfig.js`:
```javascript
export const aaiAuthConfig = {
  // TEST Environment - AAI@EduHr Lab
  issuer: 'https://fed-lab.aaiedu.hr',
  clientId: 'tvoj-client-id',
  redirectUrl: 'apuoprema://oauth/callback',

  scopes: [
    'openid', 'profile', 'email',
    'hrEduPersonRole',
    'hrEduPersonUniqueID',
    'givenName', 'sn'
  ]
};
```

Uredi `src/services/ApiService.js` za backend URL:
```javascript
const API_CONFIG = {
  BASE_URL: 'http://YOUR_LOCAL_IP:3000/api', // Tvoja lokalna IP
  TIMEOUT: 10000,
};
```

4. **Pokreni aplikaciju**
```bash
npx expo start
```

### Expo konfiguracija

Uredi `app.json`:
```json
{
  "expo": {
    "name": "APU Equipment Rental",
    "slug": "apu-equipment-rental",
    "scheme": "apuoprema",
    "platforms": ["ios", "android"],
    "orientation": "portrait",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
      "expo-image-picker"
    ]
  }
}
```

## 🔐 Autentifikacija

### AAI@EduHr OIDC tok
1. Korisnik bira tip prijave (Student/Staff ili AAI@EduHr)
2. Aplikacija pokreće OIDC flow
3. Korisnik se autentifikuje preko AAI@EduHr
4. Aplikacija prima access token i user info
5. Backend sinhronizuje korisnika i izdaje JWT
6. Aplikacija koristi JWT za API pozive

### Mock autentifikacija (Development)
```javascript
// Konstantni korisnici za testiranje
Student: dev_access_1001  // Uvek isti student
Staff: dev_access_1005    // Uvek isto osoblje
```

### Role detection
```javascript
// Baziran na hrEduPersonRole claim
const staffRoles = ['nastavnik', 'profesor', 'asistent', 'demonstrator', 'admin'];
const isStaff = roles.some(role =>
  staffRoles.some(staffRole =>
    role.toLowerCase().includes(staffRole.toLowerCase())
  )
);
```

## 📡 API Integracija

### ApiService konfiguracija
```javascript
class ApiService {
  // Equipment endpoints
  async getEquipment(filters = {})
  async createEquipment(equipmentData)
  async updateEquipment(id, equipmentData)
  async deleteEquipment(id)

  // Booking endpoints
  async getBookings(filters = {})
  async createBooking(bookingData)
  async updateBookingStatus(bookingId, status, staffNote)
  async getUserBookings(userId)

  // User endpoints
  async getUsers()
  async getUserProfile(userId)

  // Stats endpoints
  async getDashboardStats()
  async getRecentActivity()
}
```

### Error handling
```javascript
// Centralizovano error handling
try {
  const response = await apiService.createBooking(data);
} catch (error) {
  if (error.message.includes('validation')) {
    // Handle validation errors
  } else if (error.message.includes('unauthorized')) {
    // Handle auth errors
  }
}
```

## 🎨 Styling i Theme

### NativeWind setup
```javascript
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Theme context
```javascript
const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

// Usage
const { theme, toggleTheme } = useTheme();
```

### Responsive design
```javascript
// Responsive komponente
<View className="flex-1 p-4 md:p-6">
  <Text className="text-lg md:text-xl font-bold">
    Naslov
  </Text>
</View>
```

## 📸 Image Management

### Equipment image upload
```javascript
const pickImage = async () => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.8,
    aspect: [4, 3],
  });

  if (!result.canceled) {
    setEquipmentImages([...equipmentImages, ...result.assets]);
  }
};
```

### Image gallery display
```javascript
// JSON array format u bazi
const imageUrls = JSON.parse(equipment.imageUrl);

// Horizontal FlatList za slike
<FlatList
  horizontal
  data={images}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item.uri }}
      style={{ width: 300, height: 200 }}
      contentFit="cover"
    />
  )}
/>
```

## 🔄 State Management

### Booking Context
```javascript
export const BookingProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <BookingContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </BookingContext.Provider>
  );
};
```

### Custom hooks
```javascript
// useColors hook za theme support
export const useColors = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
};

// useBooking hook za refresh management
export const useBooking = () => {
  const context = useContext(BookingContext);
  return context;
};
```

## 🧪 Development i Testing

### Mock data struktura
```javascript
// Equipment object
{
  id: string,
  name: string,
  category: string,
  description: string,
  available: boolean,
  location: string,
  imageUrl: string, // JSON array za multiple slike
  bookings: Booking[]
}

// Booking object
{
  id: string,
  equipmentId: string,
  userId: string,
  startDate: Date,
  endDate: Date,
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'RETURNED' | 'CANCELLED',
  notes: string,
  user: User,
  equipment: Equipment
}
```

### Debug commands
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# View logs
npx expo logs

# Build for testing
npx expo build:android
npx expo build:ios
```

## 📱 Platform specifics

### Android konfiguracija
```json
{
  "android": {
    "package": "hr.sum.apu.equipmentrental",
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  }
}
```

### iOS konfiguracija
```json
{
  "ios": {
    "bundleIdentifier": "hr.sum.apu.equipmentrental",
    "infoPlist": {
      "NSCameraUsageDescription": "Ova aplikacija koristi kameru za dodavanje slika opreme.",
      "NSPhotoLibraryUsageDescription": "Ova aplikacija pristupa galeriji za dodavanje slika opreme."
    }
  }
}
```

## 🐛 Česti problemi

### Metro bundler problemi
```bash
# Očisti cache i restartuj
npx expo start --clear
rm -rf node_modules
npm install
```

### Navigation problemi
```javascript
// Proveri da li su svi Screen elementi pravilno zatvoreni
// Nemoj koristiti {/* */} {/* DISABLED */} - koristi {/* DISABLED */}
```

### Image loading problemi
```javascript
// Dodaj error handling za slike
<Image
  source={{ uri: imageUri }}
  onError={(error) => console.log('Image load error:', error)}
  onLoad={() => console.log('Image loaded successfully')}
/>
```

### AAI@EduHr problemi
- Proveri redirect URL u AAI@EduHr konfiguraciji
- Verifikuj da je client ID tačan
- Koristi mock autentifikaciju za development

## 🚀 Deployment

### Development build
```bash
npx expo build:android --type app-bundle
npx expo build:ios --type archive
```

### Production konfiguracija
```javascript
// Update authConfig.js za produkciju
export const aaiAuthConfig = {
  issuer: 'https://aai.aaiedu.hr', // Production URL
  clientId: 'production-client-id',
  // ... ostale postavke
};
```

## 📚 Dodatni resursi

- [Expo dokumentacija](https://docs.expo.dev/)
- [React Navigation vodič](https://reactnavigation.org/)
- [NativeWind dokumentacija](https://www.nativewind.dev/)
- [AAI@EduHr integracija](https://wiki.aaiedu.hr/)
- [React Native najbolje prakse](https://reactnative.dev/docs/getting-started)