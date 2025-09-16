# Equipment Rental - Korisnička dokumentacija

## Pregled aplikacije
Equipment Rental je mobilna aplikacija namijenjena studentima i osoblju Fakulteta za upravljanje opremom, rezervacijama i posudbu. Aplikacija podržava AAI@EduHr autentifikaciju za sigurnu prijavu kroz akademsku instituciju.

## 🚀 Pokretanje aplikacije

### Preduslovi
- Node.js (verzija 18+)
- Expo CLI
- Android Studio ili Xcode (za lokalno testiranje)

### Instalacija
```bash
npm install
npx expo start
```

## 🔐 Autentifikacija

### Prijava kroz AAI@EduHr
1. Pokrenite aplikaciju
2. Kliknite **"Prijavi se"**
3. Bit ćete preusmjereni na AAI@EduHr portal
4. Unesite svoje fakultetske podatke
5. Odobrite pristup aplikaciji
6. Automatski ćete biti vraćeni u aplikaciju

### Uloge korisnika
- **Student**: Pristup osnovnim funkcionalnostima (pregled, dodavanje vlastite opreme)
- **Staff**: Pristup administrativnim funkcionalnostima (upravljanje, statistike, QR scanner)

## 📱 Student sučelje

### Početna stranica
- **Pregled opreme**: Mreža prikaz sve dostupne opreme
- **Pretraživanje**: Unesite ključne riječi za brzu pretragu
- **Filtriranje**: Kliknite ikonu filtra za napredne opcije
  - Kategorije (Kamere, Tableti, Računala, itd.)
  - Dostupnost (Dostupno/Rezervirano)
  - Vlasništvo (Privatno/Univerzitetska oprema)

### Dodavanje vlastite opreme
1. Kliknite **"+"** ikonu na početnoj stranici
2. Dodajte fotografiju (kamera ili galerija)
3. Ispunite sva obavezna polja:
   - **Naziv**: Jasno opisno ime
   - **Kategorija**: Odaberite iz liste
   - **Opis**: Detaljne karakteristike
   - **Lokacija**: Gdje se oprema nalazi
4. Kliknite **"Dodaj opremu"**

### Detaljan prikaz opreme
- Potpune informacije o opremi
- Status dostupnosti
- Informacije o vlasniku
- Kontakt mogućnosti (za rezervaciju)

## 🛠️ Staff sučelje

### Nadzorna ploča
- **Statistike**: Ukupna oprema, dostupno, posuđeno, broj studenata
- **Nedavna aktivnost**: Prikaz najnovijih posudbi/vraćanja
- **Brz pristup**: QR scanner i ostale funkcije

### Upravljanje opremom
- **Lista sve opreme**: S mogućnostima filtriranja
- **Dodavanje nove opreme**: Poseban staff formular
- **Uređivanje**: Kliknite ikonu olovke
- **Pretraživanje**: Po nazivu ili kategoriji

### Upravljanje studentima
- **Lista studenata**: Svi registrirani korisnici
- **Informacije**: Broj aktivnih posudbi, zadnja aktivnost
- **Pretraživanje**: Po imenu ili email adresi

### QR Scanner
1. Kliknite QR ikonu iz nadzorne ploče
2. Usmjerite kameru na QR kod opreme
3. Aplikacija će automatski prepoznati kod
4. Koristite za brzu identifikaciju opreme

### Povijest aktivnosti
- Kronološki prikaz svih aktivnosti
- Filtriranje po datumu ili tipu aktivnosti
- Detaljan prikaz posudbi i vraćanja

## 🎨 Personalizacija

### Tema aplikacije
Aplikacija automatski slijedi sistemske postavke:
- **Svjetla tema**: Za dnevnu upotrebu
- **Tamna tema**: Za noćnu upotrebu ili uštede baterije

### Jezik
Aplikacija je lokalizirana na **hrvatski jezik** s podrškom za sve tekstove i poruke.

## 📋 Tipovi opreme

Aplikacija podržava sljedeće kategorije:
- **Kamere**: Digitalne kamere, objektivi
- **Stativni**: Stativovi za kamere i opremu
- **Tableti**: iPad, Android tableti
- **Studijski**: Studijska oprema i rasvjeta
- **Računala**: Laptopi, desktop računala
- **Ostalo**: Sve ostale vrste opreme

## ⚠️ Važne napomene

### Za studente
- Oprema koju dodajete bit će vidljiva svim korisnicima
- Budite precizni u opisu za izbjegavanje nesporazuma
- Možete urediti ili ukloniti svoju opremu u bilo kojem trenutku
- Drugi korisnici mogu vam poslati poruke za rezervaciju

### Za staff
- Sve administrativne akcije se logiraju
- QR kodovi se automatski generiraju za novu opremu
- Statistike se ažuriraju u stvarnom vremenu
- Koristite pretraživanje za brže pronalaženje opreme

## 🔧 Rješavanje problema

### Problemi s prijavom
1. Provjerite internetsku vezu
2. Osvježite aplikaciju
3. Provjerite valjanost fakultetskih podataka
4. Kontaktirajte IT podršku fakulteta

### Aplikacija se sporije učitava
1. Zatvorite i ponovno pokrenite aplikaciju
2. Provjerite internetsku vezu
3. Osvježite podatke povlačenjem liste prema dolje

### Problemi s fotografijama
1. Provjerite dozvole za kameru i galeriju
2. Koristite fotografije manje od 5MB
3. Podržani formati: JPG, PNG

## 📞 Podrška

Za tehničku podršku ili pitanja:
- Email: it-podrska@fakultet.hr
- Telefon: +385 1 234 5678
- Radno vrijeme: Ponedjeljak - Petak, 08:00 - 16:00

---
*Dokumentacija je ažurirana za verziju 1.0 aplikacije*