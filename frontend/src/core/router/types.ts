import type { ReactNode } from "react";

export interface RouteObject {
    path: string
    element: ReactNode
    children?: RouteObject[]
}