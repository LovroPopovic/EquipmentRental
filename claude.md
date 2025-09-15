# APU Oprema - Faza 1.4: Implementacija AAI@EduHr Autentifikacije (Login Screen Integration)

**Datum:** 21. srpnja 2025.  
**Trenutni Status:** AAI@EduHr resurs odobren i aktivan. Frontend Faza 1.1 kompletirana (LoginScreen spreman), Faza 1.2 (UI s mock podacima) u tijeku.

## 🎯 Cilj ove faze

Potpuno integrirati AAI@EduHr autentifikaciju u postojeći `LoginScreen`, omogućiti stvarnu prijavu korisnika putem AAI@EduHr sustava, te na temelju dobivene uloge (student/osoblje) **ispisati ulogu na ekranu** (`Student` / `Professor`) ili prikazati poruku o neuspjeloj prijavi.

**Napomena:** Direktno "ispisivanje uloge na ekran" je privremena mjera za brzu validaciju točnosti podataka. U kasnijim fazama (kao što je planirano), ovo će se zamijeniti stvarnim preusmjeravanjem na odgovarajuće sučelje (`StudentNavigator` ili `StaffNavigator`). Trenutni fokus je na verifikaciji AAI flowa.

## I. Priprema i Validacija AAI@EduHr Konfiguracije

Prije bilo kakve izmjene koda, ključno je potvrditi da su svi AAI@EduHr parametri točni i ažurni.

### I.1. Potvrda `authConfig.ts` parametara

*   **Zadatak:** Verificirati da `src/services/authConfig.ts` sadrži točne i odobrene parametre iz AAI@EduHr Registra Resursa.
*   **Akcija:**
    1.  Otvorite `src/services/authConfig.ts`.
    2.  Potvrdite da `clientId` **TOČNO** odgovara Client ID-u s Registra resursa (`YOUR_AAI_CLIENT_ID`).
    3.  Potvrdite da `redirectUrl` **TOČNO** odgovara onome što je upisano u Registru resursa (`apuoprema://oauth/callback`).
    4.  Potvrdite da `scopes` lista **TOČNO** odgovara onima koje ste odabrali i koji su odobreni (`openid`, `profile`, `email`, `hrEduPersonRole`).
    5.  Preporučuje se da **svježe** provjerite sve OIDC endpoint URL-ove (`issuer`, `authorizationEndpoint`, `tokenEndpoint`, `revocationEndpoint`) direktno s AAI@EduHr `.well-known` konfiguracijskog dokumenta: `https://login.aaiedu.hr/cas/oidc/.well-known/openid-configuration`. Ovi URL-ovi su dinamički i uvijek je najbolje uzeti najaktualniju verziju.
        *   Ako se razlikuju od onih u `authConfig.ts`, **ažurirajte ih**.

### I.2. Verifikacija `app.json` Schema konfiguracije

*   **Zadatak:** Osigurati da je aplikacija ispravno konfigurirana za deep linking.
*   **Akcija:** Otvorite `app.json` i potvrdite prisutnost i točnost linije `"scheme": "apuoprema",` unutar `"expo": {}` objekta. Ovo je ključno da se aplikacija otvori nakon AAI@EduHr preusmjeravanja.

## II. Povezivanje `LoginScreen.tsx` s AAI@EduHr Autentifikacijom

Ovdje ćemo modificirati postojeći `LoginScreen` da koristi `AuthService` za AAI@EduHr prijavu.

### II.1. Izmjena `LoginScreen.tsx` - Uklanjanje lokalne prijave i integracija AAI buttona

*   **Zadatak:** Ažurirati `LoginScreen` da podržava samo AAI@EduHr prijavu. Ukloniti inpute za korisničko ime i lozinku ako se ISVU login direktno radi preko AAI-ja.
*   **Datoteka:** `src/screens/auth/LoginScreen.tsx`
*   **Detalji implementacije:**

    ```typescript
    import React from 'react';
    import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ImageBackground } from 'react-native';
    import { useTheme } from '../../hooks/useColors'; // Vaš custom hook za boje
    import { authService } from '../../services/AuthService'; // Vaš AuthService
    import { CommonActions, useNavigation } from '@react-navigation/native'; // Navigacija
    import type { RootStackScreenProps } from '../../navigation/types'; // Vaši navigacijski tipovi
    import Svg, { Path } from 'react-native-svg'; // Za SVG logo

    // Typizacija propova za ekran (prilagodite prema vašem RootStackParamList)
    type Props = RootStackScreenProps<'Login'>;

    // Komponenta za APU Logo (koristiće boje teme)
    interface ApuLogoProps {
      size?: number;
      color: string;
    }
    const ApuLogo: React.FC<ApuLogoProps> = ({ size = 60, color }) => ( // Povećao default size
      <Svg width={size} height={size * 0.47} viewBox="0 0 64 30">
        <Path fillRule="evenodd" clipRule="evenodd"
              d="M10.931 13.715 5.534.172 0 13.715h10.931Z" fill={color} />
        <Path d="M26.477 25.74h-4.501V30h4.5v-4.26Z" fill={color} />
        <Path fillRule="evenodd" clipRule="evenodd"
              d="M63.603 20.942a9.059 9.059 0 0 1-18.114 0V0h18.114v20.942ZM29.631.172a6.773 6.773 0 0 1 6.772 6.772 6.773 6.773 0 0 1-6.772 6.77l-3.155.001V.173h3.155Z"
              fill={color} />
      </Svg>
    );

    const LoginScreen: React.FC<Props> = () => {
      const { colors, isDark } = useTheme(); // Dohvat boja i statusa teme
      const [loading, setLoading] = React.useState(false);
      const [loggedInRole, setLoggedInRole] = React.useState<string | null>(null); // Za privremeni ispis uloge
      const navigation = useNavigation();

      /**
       * Pokreće proces AAI@EduHr prijave.
       * Obrađuje uspjeh, pogreške i navigaciju/ispis uloge.
       */
      const handleAaiLogin = async () => {
        setLoading(true); // Aktiviraj loading indikator
        setLoggedInRole(null); // Resetiraj prethodni ispis uloge

        try {
          // Pozivanje AAI@EduHr autentifikacijskog servisa
          const authResult = await authService.loginWithAai();

          if (authResult) {
            // Dohvati parsed user info iz pohrane
            const userInfo = await authService.getUserInfo();

            if (userInfo) {
              // Privremeni ispis uloge na ekran (za testiranje)
              setLoggedInRole(userInfo.rawRoles.join(', '));
              
              // Ovdje bi se normalno radilo preusmjeravanje, ali za testiranje AAI flowa samo ispisujemo ulogu
              // Primjer navigacije za buduće faze:
              // const isStudent = userInfo.rawRoles.includes('student');
              // const isStaff = userInfo.rawRoles.some(role => ['djelatnik', 'nastavnik', 'admin'].includes(role));

              // if (isStudent && !isStaff) {
              //   navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'StudentApp' as never }] }));
              // } else if (isStaff) {
              //   navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'StaffApp' as never }] }));
              // } else {
              //   Alert.alert('Uloga neprepoznata', 'Vaša uloga nije prepoznata. Molimo kontaktirajte administratora.');
              //   await authService.logoutAai();
              // }
            } else {
              // Iako je authResult bio uspješan, userInfo nije dohvaćen - anomalija
              throw new Error('User information could not be retrieved after successful authentication.');
            }
          }
        } catch (error: any) {
          console.error('AAI Login Error:', error.message, error.code, error.data);
          // Standardizirane poruke o grešci
          let errorMessage = 'Prijava neuspješna. Pokušajte ponovno.';
          if (error.code === 'error.browser_returned_error') { // Npr. korisnik zatvorio preglednik
            errorMessage = 'Prijava je otkazana ili neuspješna u pregledniku.';
          } else if (error.message.includes('NoAccessToken')) { // Primjer specifične greške
            errorMessage = 'Autentifikacija nije vratila pristupni token.';
          } else if (error.message.includes('Invalid or unreadable ID token')) {
            errorMessage = 'Greška s korisničkim podacima nakon prijave.';
          }
          Alert.alert('Greška pri prijavi', errorMessage);
          setLoggedInRole('GREŠKA: ' + errorMessage); // Ispis greške za debug
        } finally {
          setLoading(false); // Deaktiviraj loading indikator
        }
      };

      return (
        <ImageBackground
          source={require('../../assets/images/APURI-FOTKA-ZGRADA.jpg')} // Provjerite putanju slike
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)' }]}>
            <View style={styles.contentContainer}>
              {/* APU Logo */}
              <View style={styles.logoContainer}>
                <ApuLogo color={colors.text} size={100} /> {/* Veličina loga */}
              </View>

              {/* Autentifikacijski dio */}
              <View style={styles.authSection}>
                <Text style={[styles.loginPrompt, { color: colors.text }]}>
                  Prijavite se putem AAI@EduHr računa
                </Text>

                <TouchableOpacity
                  style={[styles.aaiLoginButton, { backgroundColor: colors.primary }]}
                  onPress={handleAaiLogin}
                  disabled={loading} // Onemogući gumb dok je loading aktivan
                >
                  {loading ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.aaiLoginButtonText}>
                      Prijava
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Sekcija za ispis uloge nakon prijave */}
                {loggedInRole && (
                  <Text style={[styles.roleDisplay, { color: colors.text }]}>
                    Uloga: {loggedInRole}
                  </Text>
                )}

                {/* Opcija za "Prijava za goste" - prema Figma dizajnu */}
                <TouchableOpacity
                  style={[styles.guestLoginButton, { borderColor: colors.text }]}
                  onPress={() => Alert.alert('Gost Prijava', 'Funkcionalnost prijave za goste nije implementirana u ovoj fazi.')}
                >
                  <View style={styles.guestButtonContent}>
                    <Text style={[styles.guestLoginButtonText, { color: colors.text }]}>
                      Prijava za goste
                    </Text>
                    <Text style={[styles.guestLoginButtonText, { color: colors.text }]}>
                      →
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      );
    };

    const styles = StyleSheet.create({
      backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
      overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      contentContainer: {
        width: '100%',
        maxWidth: 400, // Ograničenje širine za bolji prikaz na većim ekranima
        alignItems: 'center',
      },
      logoContainer: {
        marginBottom: 40,
        // Dodatni stilovi za pozicioniranje loga ako treba (npr. margin-top)
      },
      authSection: {
        width: '100%',
        alignItems: 'center',
      },
      loginPrompt: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      aaiLoginButton: {
        width: '80%',
        paddingVertical: 15,
        borderRadius: 25, // Oblik "pilule"
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
      },
      aaiLoginButtonText: {
        color: '#FFFFFF', // Tekst bijel na crvenoj pozadini
        fontSize: 18,
        fontWeight: 'bold',
      },
      roleDisplay: {
        fontSize: 16,
        marginTop: 10,
        fontWeight: 'bold',
      },
      guestLoginButton: {
        width: '80%',
        paddingVertical: 10,
        borderRadius: 25, // Oblik "pilule"
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
      },
      guestButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      guestLoginButtonText: {
        fontSize: 16,
        fontWeight: '600',
      },
    });

    export default LoginScreen;
    ```

### II.2. Revizija `AuthService.ts` za specifične AAI atribute

*   **Zadatak:** Ažurirati `decodeIdToken` metodu da ispravno dohvaća atribute koje AAI@EduHr vraća u `idTokenu`, posebno `hrEduPersonRole` i `hrEduPersonUniqueID`.
*   **Datoteka:** `src/services/AuthService.ts`
*   **Detalji implementacije:**

    ```typescript
    import { authorize, refresh, revoke, AuthResult } from 'react-native-app-auth';
    import * as Keychain from 'react-native-keychain';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { aaiAuthConfig } from './authConfig';
    import { Buffer } from 'buffer';

    // Osigurajte Buffer polyfill na vrhu datoteke ako nije globalno dostupan
    if (typeof Buffer === 'undefined') {
      global.Buffer = require('buffer').Buffer;
    }

    // Ključevi za pohranu
    const ACCESS_TOKEN_KEY = 'aaiAccessToken';
    const REFRESH_TOKEN_KEY = 'aaiRefreshToken';
    const ID_TOKEN_KEY = 'aaiIdToken';
    const USER_DATA_KEY = 'aaiUserData';

    // Ažurirani UserInfo interface kako bi odražavao točne atribute iz AAI@EduHr
    export interface UserInfo {
      aaiUniqueId: string;      // Standardni 'sub' claim (iz OIDC)
      email: string;            // 'mail' claim iz AAI@EduHr
      firstName: string;        // 'givenName' claim
      lastName: string;         // 'sn' claim
      displayName: string;      // 'displayName' ili 'cn' claim
      rawRoles: string[];       // Npr. ["student", "djelatnik"] iz 'hrEduPersonRole' claima
      // Dodajte ostale atribute ako ste ih odabrali i AAI@EduHr ih vraća
      // npr. hrEduPersonAffiliation?: string;
    }

    class AuthService {
      // ... (Ostale metode kao što su loginWithAai, refreshAaiToken, logoutAai, getTokens, getUserInfo)
      // Te metode su već detaljno opisane u prethodnom Senior Developer Reportu.
      // Ovdje je ključna samo izmjena decodeIdToken i mapiranje atributa.

      /**
       * Pomoćna funkcija za dekodiranje ID tokena i dohvat korisničkih informacija.
       * Ažurirano za točne AAI@EduHr atribute.
       * @param idToken JWT string
       * @returns {UserInfo} Dekodirani korisnički podaci
       */
      private decodeIdToken(idToken: string): UserInfo {
        try {
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

          console.log("Dekodirani ID Token (provjerite atribute):", decoded); // VRLLO VAŽNO ZA DEBUG

          // Mapirajte atribute iz dekodiranog tokena na vaš UserInfo interface
          // Nazivi atributa (claimova) su ključni - moraju TOČNO odgovarati AAI@EduHr formatu
          return {
            aaiUniqueId: decoded.sub || 'unknown_sub', // Standardni OIDC subject
            email: decoded.mail || decoded.email || 'no_email@example.com', // AAI često koristi 'mail' claim
            firstName: decoded.givenName || '',
            lastName: decoded.sn || '',
            displayName: decoded.displayName || decoded.cn || 'Anonymous User',
            // hrEduPersonRole claim se obično vraća kao string[] ili string.
            rawRoles: Array.isArray(decoded.hrEduPersonRole)
                      ? decoded.hrEduPersonRole
                      : (typeof decoded.hrEduPersonRole === 'string'
                         ? [decoded.hrEduPersonRole]
                         : []),
          };
        } catch (error) {
          console.error('Greška pri dekodiranju ID tokena:', error);
          throw new Error('Neispravan ID token primljen ili ga nije moguće dekodirati.');
        }
      }

      /**
       * Pomoćna funkcija za pohranu tokena i korisničkih podataka.
       * @param authResult Rezultat autentifikacije
       * @param userInfo Parsirani korisnički podaci
       */
      private async storeAuthData(authResult: AuthResult, userInfo: UserInfo): Promise<void> {
        await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, authResult.accessToken, { service: ACCESS_TOKEN_KEY });
        if (authResult.refreshToken) {
          await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, authResult.refreshToken, { service: REFRESH_TOKEN_KEY });
        }
        if (authResult.idToken) {
          await Keychain.setGenericPassword(ID_TOKEN_KEY, authResult.idToken, { service: ID_TOKEN_KEY });
        }
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));
      }

      /**
       * Pomoćna funkcija za brisanje svih pohranjenih tokena i podataka.
       */
      private async clearAuthData(): Promise<void> {
        await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_KEY });
        await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
        await Keychain.resetGenericPassword({ service: ID_TOKEN_KEY });
        await AsyncStorage.removeItem(USER_DATA_KEY);
      }
    }

    export const authService = new AuthService();
    ```
*   **Ključni dodatak: `console.log("Dekodirani ID Token (provjerite atribute):", decoded);`** - Ovo je *iznimno* važno. Nakon prve uspješne AAI prijave, provjerite izlaz u konzoli. Vidjet ćete točne nazive atributa (`claims`) koje AAI@EduHr vraća. To će vam omogućiti da precizno mapirate `decoded.hrEduPersonRole` (ili kako god se zove u `decoded` objektu) i ostale atribute na vaš `UserInfo` interface.

## III. Testiranje Integracije

Nakon implementacije, ključno je temeljito testirati.

### III.1. Lokalno Pokretanje i Testiranje

1.  **Pokrenite Expo Development Server:**
    ```bash
    npm start
    ```
2.  **Otvorite aplikaciju na emulatoru/uređaju:**
    *   Kliknite na "Run on Android device/emulator" ili "Run on iOS simulator" u Expo Dev Tools.
3.  **Testirajte AAI@EduHr prijavu:**
    *   Kliknite na "Prijava putem AAI@EduHr" gumb na `LoginScreen.tsx`.
    *   Trebao bi se otvoriti web preglednik na AAI@EduHr login stranici.
    *   Prijavite se svojim AAI@EduHr korisničkim podacima.
    *   Nakon uspješne prijave, trebali biste biti preusmjereni natrag u aplikaciju.
    *   Ako je prijava bila uspješna, na dnu ekrana `LoginScreen` trebala bi se ispisati vaša uloga (npr. "student", "djelatnik").

### III.2. Debugging savjeti

*   **Prazan ekran nakon redirekcije?** Provjerite da li `apuoprema` shema radi ispravno (Expo CLI bi trebao to riješiti automatski). Ako ne, možda problem s `react-native-app-auth` konfiguracijom.
*   **"Invalid ID token" greška?** Pažljivo provjerite `console.log("Dekodirani ID Token:", decoded);` unutar `decodeIdToken` metode. Moguće da se nazivi atributa malo razlikuju od očekivanih (`hrEduPersonRole` vs `hrEduPersonRoles` ili slično). Prilagodite mapiranje u `UserInfo` interfaceu.
*   **"Authentication failed" / Generičke greške?** Pogledajte detaljnije logove u konzoli za `react-native-app-auth`. Provjerite sve URL-ove u `authConfig.ts` jesu li 100% točni.

## IV. Sljedeći korak (Nakon potvrde ispravnog ispisa uloge)

Kada ste sigurni da se uloga ispravno ispisuje, možete:

1.  **Ukloniti `loggedInRole` state** i njegov prikaz s `LoginScreen.tsx`.
2.  **Aktivirati `CommonActions.reset` navigaciju** unutar `handleAaiLogin` funkcije.
3.  Nastaviti s razvojem ostalih UI komponenti (Faza 1.2) i paralelnim razvojem backenda (Faza 2.x).

**Sretno s integracijom! Ovo je uzbudljiv korak!**