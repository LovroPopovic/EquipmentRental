# Projektna Dokumentacija: Mobilna Aplikacija za Iznajmljivanje Opreme (APU)

## 1. Sažetak Projekta

Ovaj dokument detaljno opisuje plan razvoja mobilne aplikacije namijenjene **Akademiji primijenjenih umjetnosti** s primarnim ciljem digitalizacije i optimizacije procesa iznajmljivanja tehničke opreme studentima. Aplikacija je konceptualizirana kao dio završnog rada te je identificiran značajan potencijal za njenu implementaciju i daljnji razvoj unutar fakultetskog okruženja.

Glavni cilj aplikacije je osigurati transparentan i učinkovit sustav za rezervaciju, praćenje dostupnosti i lokacije opreme, te unaprjeđenje komunikacije između studenata i osoblja zaduženog za opremu. Vizualni identitet aplikacije temelji se na suvremenom dizajnu s podrškom za tamni i svijetli način rada, osiguravajući optimalno korisničko iskustvo u različitim uvjetima osvjetljenja.

## 2. Opseg i Detaljne Funkcionalnosti

Aplikacija je striktno podijeljena na dva glavna korisnička sučelja, prilagođena specifičnim ulogama i potrebama:

### 2.1. Studentsko sučelje (Korisnici: Studenti)

Ovo sučelje namijenjeno je studentima koji unajmljuju opremu.

*   **Autentifikacija:**
    *   **Login:** Omogućen putem unaprijed definiranih sveučilišnih računa, koristeći postojeću infrastrukturu **ISVU API-ja** odnosno **AAI@EduHr sustava**. Proces dizajna logina bit će korigiran kako bi se integrirao s ovim vanjskim sustavom, osiguravajući glatko iskustvo prijave.
*   **Pregled i Pretraga Opreme:**
    *   **Grid Listing Opreme:** Vizualni prikaz opreme u grid formatu, omogućavajući studentima brz pregled dostupnih predmeta.
    *   **Filteri i Tražilica:** Robusne opcije za filtriranje opreme po kategorijama, statusu ili drugim relevantnim kriterijima, te funkcionalna tražilica za pronalaženje specifičnih predmeta.
*   **Pojedinačni Prikaz Proizvoda (Single Product View):**
    *   **Galerija Slika:** Mala galerija fotografija predmeta za detaljan vizualni pregled.
    *   **Meta Podaci i Opis:** Prikaz svih relevantnih informacija o proizvodu (specifikacije, stanje, itd.).
    *   **Kalendar i Opcije Rezerviranja:** Integrirani modul kalendara koji jasno prikazuje dostupnost opreme.
    *   **Opcija Vezane Opreme:** Mogućnost dodavanja preporučenih ili obveznih povezanih predmeta prilikom rezervacije (npr. objektiv uz fotoaparat, stativ uz kameru).
*   **Korisnici unutar sustava (Pregled):**
    *   Aplikacija prepoznaje uloge studenata, administratora (asistenti, demonstratori, nastavnici) što utječe na vidljivost i dostupnost funkcija.
*   **Komunikacija (Planirano za buduće faze):**
    *   **Chat Modul:** Potencijalna integracija chat funkcionalnosti za izravnu komunikaciju između studenta i nastavnika, te studenta i studenta. **Nije obvezno u prvoj fazi (MVP).**
*   **Kalendarski Modul za Rezervacije (Detaljno):**
    *   **Mod 1: Ručni Odabir:** Student može samostalno odabrati i dan preuzimanja i dan vraćanja opreme.
    *   **Mod 2: Automatsko Vraćanje:** Student odabire samo dan preuzimanja, a sustav automatski postavlja termin vraćanja prema definiranim pravilima (npr. fiksno trajanje najma).
*   **Povratne Informacije o Opremi:**
    *   **Textbox za Feedback:** Mogućnost ostavljanja tekstualnih bilješki ili povratnih informacija o stanju i iskustvu korištenja opreme.

### 2.2. Sučelje za osoblje (Korisnici: Asistenti, Demonstratori, Nastavnici, Administratori)

Ovo sučelje namijenjeno je osoblju zaduženom za iznajmljivanje i upravljanje opremom.

*   **Listing Studenata i Komunikacija:**
    *   Pregled popisa studenata s osnovnim podacima.
    *   (Planirano za buduće faze) Mogućnost iniciranja komunikacije (chat?) sa studentima.
*   **Listing Opreme s Filterima i Pretragom:**
    *   Detaljan pregled cjelokupne opreme s naprednim opcijama filtriranja i pretraživanja za osoblje.
*   **Povijest Opreme:**
    *   Praćenje detaljne povijesti zaduženja svakog komada opreme, uključujući podatke o tome tko je posudio opremu te od kada do kada.
*   **Sučelje za Unos/Uređivanje Opreme:**
    *   Specifično sučelje za unos novih predmeta opreme u inventar, te za uređivanje postojećih podataka. Bit će definirana sva polja potrebna za evidenciju (naziv, opis, kategorija, serijski broj, datum nabave, lokacija, status, itd.).
*   **QR Code / Barcode Reader:**
    *   Integrirana funkcionalnost skeniranja QR kodova ili bar kodova. Koristit će se za precizno praćenje lokacije i trenutnog korisnika svakog komada opreme.
*   **Bilješke o Opremi:**
    *   Tekstualni okvir za bilješke i komentare o opremi, slično feedbacku studenata, ali za interne potrebe osoblja (npr. servisne bilješke, oštećenja, specifične upute).

## 3. Tehnički Plan

Razvoj aplikacije bazirat će se na odabranom skupu modernih i robustnih tehnologija kako bi se osigurala visoka kvaliteta, skalabilnost i održivost projekta.

### 3.1. Predloženi tehnološki skup (Tech Stack)

*   **Mobilna aplikacija (Frontend):**
    *   **Platforma:** React Native (odabran zbog cross-platform mogućnosti i performansi bliskih nativnim).
    *   **Jezik:** TypeScript (za poboljšanu sigurnost koda, tipizaciju i lakše održavanje).
    *   **UI Stil:** NativeWind (implementacija Tailwind CSS-a u React Nativeu za brzi i konzistentni UI razvoj, usklađen s Figma dizajnom).
    *   **Navigacija:** React Navigation v6 (standard za robusnu navigaciju u React Native aplikacijama).
    *   **Upravljanje stanjem:** Zustand (lagano rješenje za globalno stanje) / React Toolkit Query (za optimizirano dohvaćanje i keširanje podataka s API-ja u budućim fazama).
*   **Backend (API):**
    *   **Jezik/Runtime:** Node.js (izabran zbog performansi, asinkronog rada i popularnosti).
    *   **Framework:** Fastify (alternativno Express.js) - za izgradnju brzog i skalabilnog RESTful API-ja.
    *   **Jezik:** TypeScript (za dosljednost s frontendom i bolju organizaciju koda).
    *   **Real-time komunikacija (za chat):** Socket.io (za dvosmjernu komunikaciju u stvarnom vremenu, planirano za buduće faze).
*   **Baza podataka:**
    *   **Sustav:** PostgreSQL (relacijska baza podataka poznata po robusnosti, skalabilnosti i integritetu podataka, idealna za kompleksne odnose entiteta poput opreme i rezervacija).
    *   **ORM (Object-Relational Mapper):** Prisma (suvremeni ORM koji nudi izvanrednu podršku za TypeScript, olakšavajući interakciju s bazom podataka).
*   **Skladištenje datoteka:**
    *   AWS S3 ili Cloudinary (za sigurno i skalabilno pohranjivanje slika opreme i drugih medijskih datoteka).

#### 3.2. Arhitektura sustava

Sustav će biti arhitektonski podijeljen na tri glavna sloja, osiguravajući jasnu razdvojenost odgovornosti i modularnost:

1.  **Korisničko sučelje (Frontend - React Native):** Odgovorno za prezentaciju podataka i interakciju s korisnikom na iOS i Android platformama. Komunicirat će isključivo s API slojem.
2.  **API Sloj (Backend - Node.js/Fastify):** Središnji sloj koji sadrži poslovnu logiku aplikacije. On će primati zahtjeve s mobilne aplikacije, obrađivati ih (npr. provjera valjanosti rezervacije) i komunicirati sa slojem podataka.
3.  **Sloj podataka (Database - PostgreSQL + Prisma):** Odgovoran za trajno pohranjivanje svih informacija relevantnih za aplikaciju, uključujući detalje o korisnicima, opremi, rezervacijama, komunikaciji i bilješkama.

#### 3.3. Autentifikacija putem AAI@EduHr (Detaljno)

Kao odgovor na zahtjev za korištenjem postojećih sveučilišnih računa, planira se dublja integracija s AAI@EduHr sustavom.

*   **Povezanost:** AAI@EduHr sustav (koji održava SRCE) služit će kao primarni i jedini autoritativni izvor za autentifikaciju korisnika. Nakon uspješne autentifikacije putem AAI@EduHr, aplikacija će dobiti potvrdu identiteta korisnika i njegove osnovne atribute (poput ISVU ID-a, imena, e-maila, uloge). Svi ostali specifični podaci vezani za funkcioniranje aplikacije (poput popisa rezervirane opreme, korisničkih preferencija, chat povijesti) bit će pohranjeni i upravljani unutar vlastite PostgreSQL baze.
*   **Predloženi Protokol:** Za mobilnu aplikaciju, **OpenID Connect (OIDC)** je preferirani protokol zbog svoje modernosti, sigurnosti i prilagođenosti mobilnim platformama. OIDC omogućuje dobivanje JWT (JSON Web Tokena) koji se može sigurno koristiti za daljnju autorizaciju API poziva unutar aplikacije.
*   **Potrebni koraci za integraciju:** Obuhvaćaju registraciju aplikacije kao "Servisnog provajdera" unutar AAI@EduHr infrastrukture (putem SRCE-a), što uključuje dobivanje Client ID-a i konfiguraciju specifičnih Redirect URI-ja za mobilnu aplikaciju.

## 4. Vizualni Dizajn

Detaljan i sveobuhvatan vizualni dizajn aplikacije, koji uključuje kompletan set ekrana i interakcija za oba sučelja (studentsko i osoblje), s podrškom za tamni i svijetli način rada, dostupan je na priloženim Figma linkovima. Dizajn osigurava dosljednost i visoku razinu korisničkog iskustva.

*   **Figma linkovi:**
    *   **Glavni dizajn:** https://www.figma.com/file/oFoqihvH5mRmqcoH97yDXm/Jan-Pavleti%C4%87-%E2%80%93-Iznajmi-app?type=design&node-id=484%3A510&mode=design&t=ca94szD0lXD5pYaC-1

## 5. Trenutni Status i Plan Razvoja

Trenutno se projekt nalazi u **Fazi 1: Čisti Frontend (100% Mock Podaci)**.

### 5.1. Dosadašnji napredak

Postavili smo snažan temelj za daljnji razvoj. Svi ključni koraci inicijalne konfiguracije su uspješno završeni:

*   ✅ **Inicijalizacija Projekta:** Expo React Native projekt je uspješno inicijaliziran s podrškom za TypeScript.
*   ✅ **Instalacija Ovisnosti:** Sve osnovne ovisnosti potrebne za frontend razvoj su instalirane, uključujući React Navigation (za navigaciju) i NativeWind/TailwindCSS (za stiliziranje).
*   ✅ **Struktura Direktorija:** Cjelokupna modularna struktura direktorija unutar `src/` mape je kreirana i organizirana prema najboljim praksama, s jasno definiranim modulima za komponente, ekrane, navigaciju, podatke, kontekst, hookove i pomoćne funkcije. Postojanje i ispravnost strukture je provjerena.
*   ✅ **Konfiguracija Stiliziranja:** Tailwind CSS konfiguracija je ispravno postavljena i optimizirana za kompatibilnost s NativeWind-om, osiguravajući učinkovito stiliziranje korisničkog sučelja.
*   ✅ **Poboljšana TypeScript Podrška:** Dodatna TypeScript podrška je poboljšana integracijom `@types/react-native`, što osigurava bolju tipizaciju i robustnost koda.

### 5.2. Sljedeći koraci (Faza 1.1 - UI Implementacija)

Nakon što su temelji postavljeni, fokus je sada na implementaciji prvih vizualnih komponenti i ekrana:

*   Implementacija **Tamnog/Svijetlog načina rada** prema Figma dizajnu.
*   Izgradnja kompletnog **Login Ekrana** s mock logikom (samo za vizualni prikaz i simulaciju prelaska na Home ekran).
*   Razvoj `EquipmentCard` komponente.
*   Implementacija **Home Ekrana** s prikazom opreme u gridu koristeći mock podatke, uključujući UI za pretraživanje i filtriranje.
*   **Cilj:** Kompletno vizualno i interaktivno sučelje koje simulira funkcionalnost s lažnim podacima.

### 5.3. Faze razvoja koje slijede

*   **Faza 2: Backend Temelji & Interna Autentifikacija:** Postavljanje centralnog backend sustava i baze podataka, te interna autentifikacija. Obuhvaća postavku Fastify/Node.js backend servera, definiranje detaljne Prisma schema modela za sve entitete (Korisnici, Oprema, Rezervacije, Poruke, Kategorije). Konfiguracija PostgreSQL baze podataka. Implementacija CRUD (Create, Read, Update, Delete) API endpointa za dohvat i upravljanje opremom. Implementacija **privremenog, jednostavnog (mock) sustava prijave** na backendu (npr. e-mail/lozinka) za interno testiranje i generiranje JWT tokena. Povezivanje frontend aplikacije s ovim backend API-jem, zamjenjujući mock podatke stvarnim podacima iz baze.

*   **Faza 3: AAI@EduHr Integracija:** Zamjena privremene autentifikacije punopravnom AAI@EduHr integracijom. Ovaj korak će se provesti nakon dobivanja potrebnih podataka od SRCE-a (Client ID, Secret, Redirect URI). Obuhvaća implementaciju OpenID Connect protokola unutar React Native aplikacije. Prilagodba backend logike za provjeru i prihvaćanje tokena dobivenih od AAI@EduHr. Mapiranje atributa AAI korisnika na interne korisničke profile u bazi.

*   **Faza 4+: Buduće Faze i Unaprjeđenja:** Obuhvaćat će implementaciju funkcionalnog chat modula u stvarnom vremenu (Socket.io). Potpuna integracija QR koda / Barcode reader-a za praćenje točne lokacije i korisnika opreme. Razvoj detaljnih izvješća i prikaza povijesti korištenja opreme za osoblje. Sustav push notifikacija za podsjetnike o preuzimanju/vraćanju i isteku roka. Razvoj naprednih funkcija za administraciju opreme i korisnika.

## 6. Otvorena Pitanja

Glavno i ključno otvoreno pitanje u ovoj fazi razvoja jest precizan postupak i potrebne informacije za **registraciju mobilne aplikacije unutar AAI@EduHr sustava** u svrhu testiranja. Također, bitna je informacija o dostupnosti eventualnih **testnih okruženja** za AAI@EduHr autentifikaciju. U tu svrhu poslan je upit AAI koordinatoru Sveučilišta u Rijeci.

---
**Datum:** [Današnji datum, npr. 21. srpnja 2025.]