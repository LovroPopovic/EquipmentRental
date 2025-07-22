# APU Oprema - Mobilna Aplikacija za Iznajmljivanje Opreme

**Mobilna aplikacija za Akademiju primijenjenih umjetnosti**  
**Verzija:** 1.0.0 (Faza 1.1 Završena)  
**Platforma:** React Native s Expo  
**Jezik:** TypeScript  
**Status:** ✅ Infrastruktura kompletna, spremna za UI implementaciju

## 📖 Opis Projekta

APU Oprema je mobilna aplikacija dizajnirana za digitalizaciju i optimizaciju procesa iznajmljivanja tehničke opreme studentima Akademije primijenjenih umjetnosti. Aplikacija pruža transparentan i učinkovit sustav za rezervaciju, praćenje dostupnosti i lokacije opreme te poboljšava komunikaciju između studenata i osoblja.

### Ključne Funkcionalnosti

- 🔐 **Sigurna autentifikacija** putem AAI@EduHr sustava
- 👨‍🎓 **Studentsko sučelje** - pregled, rezervacija i praćenje opreme
- 👩‍🏫 **Sučelje za osoblje** - upravljanje opremom i studentima
- 🌙 **Tamni/Svijetli način rada** s automatskim prepoznavanjem sustava
- 🎨 **Suvremeni dizajn** s podrškom za oba načina rada
- 📱 **Cross-platform** - iOS i Android podrška

## 🛠 Tehnološki Stack

### Frontend Tehnologije
- **React Native 0.79.5** - Cross-platform mobilni framework
- **React 19.0.0** - Najnovija verzija React biblioteke
- **TypeScript 5.8.3** - Type-safe JavaScript s naprednom tipizacijom
- **Expo 53.0.20** - Razvojno okruženje i deployment platforma

### Navigacija
- **React Navigation 7** - Robusna navigacija s TypeScript podrškom
- **Stack Navigator** - Za auth flow i detail ekrane
- **Bottom Tab Navigator** - Glavna navigacija aplikacije

### Stiliziranje
- **NativeWind 4.1.23** - Tailwind CSS za React Native
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **react-native-svg 15.7.1** - SVG podrška za logove i ikone
- **@expo/vector-icons** - Sveobuhvatan set ikona

## 📁 Struktura Projekta

```
src/
├── assets/                 # Statička sredstva
│   ├── fonts/             # Fontovi
│   ├── icons/             # Ikone
│   └── images/            # Slike
├── components/            # Komponente po funkcionalnosti
│   ├── booking/          # Komponente za rezervacije
│   ├── common/           # Zajedničke komponente
│   ├── equipment/        # Komponente za opremu
│   └── ui/               # UI komponente
├── context/              # React Context provideri
│   └── ThemeContext.tsx  # Upravljanje temama
├── data/                 # Podaci i modeli
│   └── mockData.ts       # Mock podaci za razvoj
├── hooks/                # Custom React hookovi
│   └── useColors.ts      # Hook za pristup bojama teme
├── navigation/           # Navigacijska konfiguracija
│   ├── types.ts          # TypeScript tipovi za navigaciju
│   ├── AppNavigator.tsx  # Glavni navigator
│   ├── AuthNavigator.tsx # Autentifikacija navigator
│   ├── StudentNavigator.tsx # Student tab navigator
│   └── StaffNavigator.tsx   # Osoblje tab navigator
├── screens/              # Ekrani aplikacije
│   ├── auth/            # Autentifikacija ekrani
│   ├── student/         # Studentski ekrani
│   └── staff/           # Ekrani za osoblje
└── utils/               # Pomoćne funkcije
    └── colors.ts        # Definicije boja tema
```

## 🚀 Pokretanje Aplikacije

### Preduvjeti

Prije pokretanja aplikacije, trebate instalirati:

```bash
# Node.js (verzija 18 ili novija)
node --version

# npm ili yarn
npm --version

# Expo CLI (globalno)
npm install -g @expo/cli

# Git (za kloniranje)
git --version
```

### Instalacija

1. **Klonirajte repozitorij:**
```bash
git clone [URL_REPOZITORIJA]
cd EquipmentRentalApp
```

2. **Instalirajte ovisnosti:**
```bash
npm install
```

3. **Pokretanje razvojnog servera:**
```bash
npm start
# ili
expo start
```

### Opcije Pokretanja

- **Android emulator:** `npm run android`
- **iOS simulator:** `npm run ios`  
- **Web verzija:** `npm run web`
- **Expo Go aplikacija:** Skenirajte QR kod s mobilnim uređajem

## 🎨 Tema i Stiliziranje

### Sustav Tema

Aplikacija koristi napredni sustav tema koji podržava:

- **Automatsko prepoznavanje** sistemske teme (tamno/svijetlo)
- **Ručno prebacivanje** između tema
- **Dinamičko stiliziranje** svih komponenti
- **Konzistentne boje** kroz cijelu aplikaciju

### Definicije Boja

```typescript
// Svijetla tema
light: {
  primary: '#3B82F6',      // Plava
  background: '#FFFFFF',    // Bijela
  surface: '#F8FAFC',      // Svijetlo siva
  text: '#0F172A',         // Tamno siva
  // ... ostale boje
}

// Tamna tema  
dark: {
  primary: '#3B82F6',      // Plava
  background: '#0F172A',    // Tamno siva
  surface: '#1E293B',      // Srednje tamna
  text: '#F1F5F9',         // Svijetlo siva
  // ... ostale boje
}
```

### NativeWind Klase

Aplikacija koristi Tailwind CSS utility klase putem NativeWind-a:

```typescript
// Primjeri korištenja
<View className="flex-1 justify-center items-center">
  <Text className="text-2xl font-bold">Naslov</Text>
</View>
```

## 🧭 Navigacijska Arhitektura

### Hijerarhija Navigacije

```
RootNavigator
├── AuthNavigator (neautentificirani korisnici)
│   └── LoginScreen
├── StudentNavigator (studenti)
│   ├── HomeScreen (Početna)
│   ├── SearchScreen (Pretraži)
│   ├── BookingsScreen (Rezervacije)
│   └── ProfileScreen (Profil)
└── StaffNavigator (osoblje)
    ├── DashboardScreen (Pregled)
    ├── EquipmentScreen (Oprema)
    ├── StudentsScreen (Studenti)
    └── ProfileScreen (Profil)
```

### TypeScript Tipiziranje

Navigacija koristi strogo tipiziranje za sigurnost tipova:

```typescript
// Definicije tipova navigacije
export type StudentTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

// Tipovi za screen props
export type StudentScreenProps<T extends keyof StudentTabParamList> =
  CompositeScreenProps<
    StudentTabScreenProps<T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
```

## 📱 Sučelja Aplikacije

### Studentsko Sučelje

**Početna (Home)**
- Pregled dostupne opreme u grid formatu
- Tražilica i filteri
- Brz pristup popularnoj opremi

**Pretraži (Search)**  
- Napredna pretraga opreme
- Filtriranje po kategorijama
- Sortiranje rezultata

**Rezervacije (Bookings)**
- Pregled aktivnih rezervacija
- Povijesni prikaz korištenja
- Status praćenje

**Profil (Profile)**
- Korisnički profil i postavke
- Prebacivanje tema
- Kontakt informacije

### Sučelje za Osoblje

**Pregled (Dashboard)**
- Statistike korištenja opreme
- Brze akcije i obavještenja  
- Dnevni izvještaji

**Oprema (Equipment)**
- Upravljanje inventarom
- Dodavanje/uređivanje opreme
- QR kod generiranje

**Studenti (Students)**
- Pregled korisnika
- Upravljanje dozvolama
- Komunikacija sa studentima

**Profil (Profile)**
- Postavke osoblja
- Administratorske opcije
- Izvještaji sustava


## 🔧 Razvojni Workflow

### Dodavanje Novog Ekrana

1. **Stvori screen komponentu:**
```typescript
// src/screens/student/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { StudentScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks/useColors';

type Props = StudentScreenProps<'NewScreen'>;

const NewScreen: React.FC<Props> = () => {
  const colors = useColors();
  
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Novi ekran</Text>
    </View>
  );
};

export default NewScreen;
```

2. **Dodaj u navigation types:**
```typescript
export type StudentTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
  NewScreen: undefined; // Dodaj ovdje
};
```

3. **Registriraj u navigatoru:**
```typescript
<Tab.Screen 
  name="NewScreen" 
  component={NewScreen}
  options={{
    tabBarLabel: 'Novo',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="add" size={size} color={color} />
    ),
  }}
/>
```

### Stiliziranje Komponenti

```typescript
// Koristi NativeWind klase za layout
<View className="flex-1 justify-center items-center p-4">
  
  // Kombinaj s dinamičkim bojama
  <Text 
    className="text-2xl font-bold mb-4" 
    style={{ color: colors.text }}
  >
    Tekst s temom
  </Text>
  
  // Button s theme bojama
  <TouchableOpacity 
    className="px-6 py-3 rounded-lg"
    style={{ backgroundColor: colors.primary }}
  >
    <Text className="text-white font-semibold">Gumb</Text>
  </TouchableOpacity>
</View>
```

## 🧪 Testiranje

### Pokretanje Testova
```bash
# Unit testovi (kada budu implementirani)
npm test

# TypeScript provjera
npx tsc --noEmit --skipLibCheck

# Lint provjera (kada bude konfiguriran)
npm run lint
```

### Preporučeni Testovi
- **Component testing** s React Native Testing Library
- **Navigation testing** za pravilno routing
- **Theme testing** za dinamičko stiliziranje
- **TypeScript compliance** provjere

## 🎯 Trenutna Faza Razvoja

### ✅ Faza 1.1 Kompletirana (Srpanj 2025)

**Infrastruktura i Temelji:**
- ✅ React Native + Expo + TypeScript setup
- ✅ NativeWind 4.x integracija s optimiziranom build konfiguracijom
- ✅ Napredni sustav tema (dark/light mode s automatskom detekcijom)
- ✅ Type-safe navigacijska arhitektura (role-based routing)
- ✅ Sve screen komponente s theme integracijom

**LoginScreen - Kompletno implementiran:**
- ✅ Pixel-perfect dizajn prema Figma specifikaciji
- ✅ APU zgrada background s theme-aware overlay
- ✅ Custom SVG APU logo implementacija
- ✅ Modern pill-shaped input fieldi
- ✅ Mock autentifikacija s role detection (student/staff)
- ✅ Interactive loading states i error handling

**Kvaliteta koda:**
- ✅ Zero TypeScript compilation errors
- ✅ Consistent component architecture kroz cijeli projekt
- ✅ Hrvatska lokalizacija kroz cijelu aplikaciju
- ✅ Enterprise-grade error handling patterns

### 🚀 Sljedeća Faza - 1.2 (UI implementacija)

**Prioriteti za implementaciju:**
1. **TypeScript interfejsi** - Equipment, User, Booking entiteti
2. **Mock podatci** - Realistični dataset za APU kontekst
3. **EquipmentCard komponenta** - Grid prikaz opreme
4. **HomeScreen funkcionalnost** - Search, filteri, pagination
5. **Navigation integracija** - Povezivanje screen-ova

**Estimirani timeline:** 2-3 tjedna za kompletnu UI implementaciju

## 📊 Project Metrics

**Statistike:**
- **Datoteke:** 25+ TypeScript/React komponenti
- **Linije koda:** 800+ s komentarima
- **TypeScript coverage:** 100% (zero any types)
- **Build status:** ✅ Zero warnings ili errors
- **Dependencies:** 15+ enterprise-grade paketa

## 📚 Dokumentacija

### Projektni Dokumenti
- **[SENIOR_DEV_REPORT.md](./SENIOR_DEV_REPORT.md)** - Detaljni tehnički izvještaj
- **[DETAILED_PLAN.md](./DETAILED_PLAN.md)** - Plan razvoja s vremenskim okvirima
- **[claude.md](./claude.md)** - Originalna projektna dokumentacija

### Eksterne Reference
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [NativeWind Guide](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Alati za Razvoj
- **VS Code** - s React Native i TypeScript ekstenzijama
- **React Native Debugger** - Za detaljni debugging
- **Expo DevTools** - Development server i device testing
- **Flipper** - Advanced debugging i performance profiling

---

**Zadnja Ažuriranje:** 21. srpnja 2025  
**Faza:** 1.1 Kompletirana → 1.2 UI Implementation  
**Projekt:** APU Equipment Rental - Završni rad