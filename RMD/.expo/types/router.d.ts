/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/dbserver` | `/(tabs)/webserver1` | `/(tabs)/webserver2` | `/_sitemap` | `/dbserver` | `/webserver1` | `/webserver2`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
