# APU Oprema - Projektna Dokumentacija (Claude Code)

**Datum:** 15. rujna 2025.  
**Trenutni Status:** Faza 1.2 kompletirana - Migracija na JavaScript i AAI@EduHr integracija

## 🎯 Trenutno Stanje Projekta

### ✅ Završene Faze

**Faza 1.1 (Srpanj 2025):**
- React Native + Expo + TypeScript setup
- Navigacijska arhitektura s theme sustavom
- LoginScreen s Figma dizajnom
- Mock autentifikacija

**Faza 1.2 (Rujan 2025):**
- ✅ **TypeScript → JavaScript migracija kompletirana**
- ✅ **AAI@EduHr OIDC autentifikacija implementirana**
- ✅ **PKCE flow za sigurnu mobilnu autentifikaciju**
- ✅ **User role detection iz hrEduPersonRole claim-a**

## 🔧 Trenutna Konfiguracija

### AAI@EduHr Setup
```javascript
// src/services/authConfig.js
export const aaiAuthConfig = {
  issuer: 'https://login.aaiedu.hr',
  clientId: 'YOUR_AAI_CLIENT_ID',
  redirectUrl: 'apuoprema://oauth/callback',
  scopes: ['openid', 'profile', 'email', 'hrEduPersonRole'],
  
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.aaiedu.hr/sso/module.php/oidc/authorize.php',
    tokenEndpoint: 'https://login.aaiedu.hr/sso/module.php/oidc/token.php',
    revocationEndpoint: 'https://login.aaiedu.hr/sso/module.php/oidc/logout.php',
  },
  
  useNonce: true,
  usePKCE: true, // Za public client (mobilna aplikacija)
  additionalParameters: {},
};
```

### App Configuration
```json
// app.json
{
  "expo": {
    "scheme": "apuoprema",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{"scheme": "apuoprema"}],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## 📱 Funkcionalnosti

### Autentifikacija Flow
1. **Korisnik klikne "Prijava" na LoginScreen**
2. **Otvara se AAI@EduHr stranica u browseru**
3. **Korisnik se prijavljuje s AAI@EduHr podacima**
4. **Aplikacija dobiva ID token s ulogama**
5. **Parsiranje hrEduPersonRole claim-a**
6. **Prikaz uloge na ekranu (trenutno)**

### Podržane Uloge
- `student` - Student APU-a
- `djelatnik` / `nastavnik` / `admin` - Osoblje APU-a

## 🚀 Sljedeća Faza - Backend Integracija

### Planovi za Fazu 1.3
1. **Express backend s Prisma ORM**
   - Node.js server setup
   - Database schema dizajn
   - RESTful API endpoints

2. **Database entiteti:**
   - `User` (AAI@EduHr podaci)
   - `Equipment` (inventar opreme)
   - `Booking` (rezervacije)
   - `Category` (kategorije opreme)

3. **API endpoints:**
   - `GET /api/equipment` - Lista opreme
   - `POST /api/bookings` - Nova rezervacija
   - `GET /api/bookings/user/:id` - Korisničke rezervacije
   - `PUT /api/equipment/:id` - Ažuriranje opreme (osoblje)

4. **Authentication middleware:**
   - AAI@EduHr token validation
   - Role-based access control
   - Session management

### Tehnološki Stack Backend
- **Node.js** s Express frameworkom
- **Prisma ORM** za database abstraction
- **PostgreSQL** ili **MySQL** database
- **JWT validation** za AAI@EduHr tokene
- **CORS konfiguracija** za mobile client

## 🛠 Razvojne Naredbe

```bash
# Pokretanje frontend aplikacije
npm start

# Pokretanje Android emulatora
npm run android

# Pokretanje iOS simulatora  
npm run ios

# Web verzija (za testiranje)
npm run web
```

## 📚 Dokumentacija

### Ključne datoteke
- `README.md` - Glavna projektna dokumentacija
- `src/services/AuthService.js` - AAI@EduHr autentifikacija
- `src/services/authConfig.js` - OIDC konfiguracija
- `src/screens/auth/LoginScreen.jsx` - Login sučelje
- `app.json` - Expo konfiguracija

### Eksterne reference
- [AAI@EduHr OIDC dokumentacija](https://wiki.srce.hr/spaces/AAIUPUTE/pages/59867172/Autentikacija+pomo%C4%87u+protokola+OpenID+Connect+OIDC)
- [React Native App Auth](https://github.com/FormidableLabs/react-native-app-auth)
- [Expo deep linking](https://docs.expo.dev/guides/deep-linking/)

## 📊 Projekt Statistike

**Stanje koda:**
- JavaScript compliance: 100%
- Metro bundler: ✅ Zero errors
- AAI@EduHr: ✅ Funkcionalna integracija
- Navigation: ✅ Role-based routing spreman

**Struktura:**
- Frontend: React Native (JavaScript)
- Authentication: AAI@EduHr OIDC
- Styling: NativeWind + Tailwind CSS
- State: React Context + hooks

---

**Zadnji update:** 15. rujna 2025  
**Status:** Spreman za backend integraciju  
**Sljedeći korak:** Express + Prisma setup