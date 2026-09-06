import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as BookRouteImport } from './routes/book'
import { Route as BookingSuccessRouteImport } from './routes/booking-success'
import { Route as BuyRouteImport } from './routes/buy'
import { Route as HomeRouteImport } from './routes/home'
import { Route as LoginRouteImport } from './routes/login'
import { Route as ProfileRouteImport } from './routes/profile'
import { Route as SellRouteImport } from './routes/sell'
import { Route as RepairsIndexRouteImport } from './routes/repairs.index'
import { Route as RepairsRepairIdRouteImport } from './routes/repairs.$repairId'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const BookRoute = BookRouteImport.update({
  id: '/book',
  path: '/book',
  getParentRoute: () => rootRouteImport,
} as any)
const BookingSuccessRoute = BookingSuccessRouteImport.update({
  id: '/booking-success',
  path: '/booking-success',
  getParentRoute: () => rootRouteImport,
} as any)
const BuyRoute = BuyRouteImport.update({
  id: '/buy',
  path: '/buy',
  getParentRoute: () => rootRouteImport,
} as any)
const HomeRoute = HomeRouteImport.update({
  id: '/home',
  path: '/home',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const ProfileRoute = ProfileRouteImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => rootRouteImport,
} as any)
const SellRoute = SellRouteImport.update({
  id: '/sell',
  path: '/sell',
  getParentRoute: () => rootRouteImport,
} as any)
const RepairsIndexRoute = RepairsIndexRouteImport.update({
  id: '/repairs/',
  path: '/repairs/',
  getParentRoute: () => rootRouteImport,
} as any)
const RepairsRepairIdRoute = RepairsRepairIdRouteImport.update({
  id: '/repairs/$repairId',
  path: '/repairs/$repairId',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/book': typeof BookRoute
  '/booking-success': typeof BookingSuccessRoute
  '/buy': typeof BuyRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/profile': typeof ProfileRoute
  '/sell': typeof SellRoute
  '/repairs/$repairId': typeof RepairsRepairIdRoute
  '/repairs/': typeof RepairsIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/book': typeof BookRoute
  '/booking-success': typeof BookingSuccessRoute
  '/buy': typeof BuyRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/profile': typeof ProfileRoute
  '/sell': typeof SellRoute
  '/repairs/$repairId': typeof RepairsRepairIdRoute
  '/repairs': typeof RepairsIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/book': typeof BookRoute
  '/booking-success': typeof BookingSuccessRoute
  '/buy': typeof BuyRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/profile': typeof ProfileRoute
  '/sell': typeof SellRoute
  '/repairs/$repairId': typeof RepairsRepairIdRoute
  '/repairs/': typeof RepairsIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
  | '/'
  | '/admin'
  | '/book'
  | '/booking-success'
  | '/buy'
  | '/home'
  | '/login'
  | '/profile'
  | '/sell'
  | '/repairs/$repairId'
  | '/repairs/'
  fileRoutesByTo: FileRoutesByTo
  to:
  | '/'
  | '/admin'
  | '/book'
  | '/booking-success'
  | '/buy'
  | '/home'
  | '/login'
  | '/profile'
  | '/sell'
  | '/repairs/$repairId'
  | '/repairs'
  id:
  | '__root__'
  | '/'
  | '/admin'
  | '/book'
  | '/booking-success'
  | '/buy'
  | '/home'
  | '/login'
  | '/profile'
  | '/sell'
  | '/repairs/$repairId'
  | '/repairs/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  BookRoute: typeof BookRoute
  BookingSuccessRoute: typeof BookingSuccessRoute
  BuyRoute: typeof BuyRoute
  HomeRoute: typeof HomeRoute
  LoginRoute: typeof LoginRoute
  ProfileRoute: typeof ProfileRoute
  SellRoute: typeof SellRoute
  RepairsRepairIdRoute: typeof RepairsRepairIdRoute
  RepairsIndexRoute: typeof RepairsIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/book': {
      id: '/book'
      path: '/book'
      fullPath: '/book'
      preLoaderRoute: typeof BookRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/booking-success': {
      id: '/booking-success'
      path: '/booking-success'
      fullPath: '/booking-success'
      preLoaderRoute: typeof BookingSuccessRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/buy': {
      id: '/buy'
      path: '/buy'
      fullPath: '/buy'
      preLoaderRoute: typeof BuyRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/home': {
      id: '/home'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/profile': {
      id: '/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof ProfileRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/sell': {
      id: '/sell'
      path: '/sell'
      fullPath: '/sell'
      preLoaderRoute: typeof SellRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/repairs/': {
      id: '/repairs/'
      path: '/repairs'
      fullPath: '/repairs/'
      preLoaderRoute: typeof RepairsIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/repairs/$repairId': {
      id: '/repairs/$repairId'
      path: '/repairs/$repairId'
      fullPath: '/repairs/$repairId'
      preLoaderRoute: typeof RepairsRepairIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  BookRoute: BookRoute,
  BookingSuccessRoute: BookingSuccessRoute,
  BuyRoute: BuyRoute,
  HomeRoute: HomeRoute,
  LoginRoute: LoginRoute,
  ProfileRoute: ProfileRoute,
  SellRoute: SellRoute,
  RepairsRepairIdRoute: RepairsRepairIdRoute,
  RepairsIndexRoute: RepairsIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
