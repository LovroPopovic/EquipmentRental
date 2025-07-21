# APU Oprema - Mobilna Aplikacija za Iznajmljivanje Opreme

**Mobilna aplikacija za Akademiju primijenjenih umjetnosti**  
**Verzija:** 1.0.0  
**Platforma:** React Native s Expo  
**Jezik:** TypeScript

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

## 🎯 Trenutna Faza Razvoja

### Završeno ✅

1. **Infrastruktura projekta**
   - Expo React Native setup s TypeScript podrškom
   - NativeWind konfiguracija za stiliziranje
   - React Navigation s tipiziranim routing-om

2. **Sustav tema**
   - Kompletna implementacija tamnog/svijetlog načina rada
   - Context API za upravljanje stanjem teme
   - Dinamičko stiliziranje komponenti

3. **Navigacijska arhitektura**
   - Role-based routing (student/osoblje)
   - TypeScript tipiziranje navigacije
   - Tab i stack navigatori s ikonama

4. **Osnovni ekrani**
   - Placeholder komponente za sve ekrane
   - Konzistentno stiliziranje
   - Tema integracija

### U Tijeku 🔄

- **Mock podatci i TypeScript interfejsi** za opremu i korisnike
- **EquipmentCard komponenta** za prikaz opreme
- **Poboljšani Home ekran** s grid layoutom

### Planirano 📅

1. **Faza 1.2: UI implementacija**
   - Kompletni UI s mock podacima
   - Funkcionalnost pretraživanja i filtriranja
   - Rezervacijski sustav

2. **Faza 2: Backend integracija**
   - Node.js/Fastify API
   - PostgreSQL baza podataka
   - Prisma ORM

3. **Faza 3: AAI@EduHr integracija**
   - Sveučilišna autentifikacija
   - OpenID Connect protokol
   - Korisničke dozvole

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

## 📚 Korisni Resursi

### Dokumentacija
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Alati za Razvoj
- **VS Code** s React Native ekstenzijama
- **React Native Debugger** za debugging
- **Expo DevTools** za testiranje
- **Flipper** za napredni debugging

## 🤝 Doprinošenje

### Git Workflow
1. Stvori feature branch: `git checkout -b feature/nova-funkcionalnost`
2. Commit promjene: `git commit -m "Dodaj novu funkcionalnost"`
3. Push branch: `git push origin feature/nova-funkcionalnost`
4. Stvori Pull Request

### Coding Standards
- **TypeScript** za sve nove datoteke
- **Funkcionalne komponente** s hookovima
- **NativeWind klase** za stiliziranje
- **Hrvatska lokalizacija** za UI tekstove
- **Dosljedne naming konvencije**

## 📞 Kontakt

**Razvojni Tim**  
**Projekt:** Završni rad APU  
**Email:** [kontakt@example.com]

---

**Zadnja Ažuriranje:** 21. srpnja 2025  
**Status:** Aktivni razvoj - Faza 1.1