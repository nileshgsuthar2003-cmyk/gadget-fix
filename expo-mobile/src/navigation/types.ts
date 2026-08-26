import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  MyRepairs: undefined;
  Book: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Tabs: NavigatorScreenParams<RootTabParamList>;
  RepairDetails: { repairId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeTabScreenProps<T extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
