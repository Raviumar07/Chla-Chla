declare module 'react-leaflet' {
  import * as React from 'react';
  import { Map as LeafletMap, LatLngExpression, Layer, Icon } from 'leaflet';

  export interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    center: LatLngExpression;
    zoom: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    zoomControl?: boolean;
  }

  export const MapContainer: React.FC<MapContainerProps>;

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export const TileLayer: React.FC<TileLayerProps>;

  export interface MarkerProps {
    position: LatLngExpression;
    children?: React.ReactNode;
    icon?: Icon;
    key?: React.Key;
  }

  export const Marker: React.FC<MarkerProps>;

  export interface PopupProps {
    children?: React.ReactNode;
  }

  export const Popup: React.FC<PopupProps>;

  export interface PolylineProps {
    positions: LatLngExpression[];
    color?: string;
    weight?: number;
    opacity?: number;
  }

  export const Polyline: React.FC<PolylineProps>;

  export function useMap(): LeafletMap;
}
