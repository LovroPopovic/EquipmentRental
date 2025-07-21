import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Student Stack
export type StudentTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type StudentTabScreenProps<T extends keyof StudentTabParamList> =
  BottomTabScreenProps<StudentTabParamList, T>;

// Staff Stack
export type StaffTabParamList = {
  Dashboard: undefined;
  Equipment: undefined;
  Students: undefined;
  Profile: undefined;
};

export type StaffTabScreenProps<T extends keyof StaffTabParamList> =
  BottomTabScreenProps<StaffTabParamList, T>;

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  StudentApp: undefined;
  StaffApp: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Combined navigation props
export type StudentScreenProps<T extends keyof StudentTabParamList> =
  CompositeScreenProps<
    StudentTabScreenProps<T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type StaffScreenProps<T extends keyof StaffTabParamList> =
  CompositeScreenProps<
    StaffTabScreenProps<T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}