declare module '@heroicons/react/outline' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    titleId?: string;
  }
  
  export type Icon = FC<IconProps>;
  
  export const HomeIcon: Icon;
  export const CodeIcon: Icon;
  export const ViewGridIcon: Icon;
  export const AcademicCapIcon: Icon;
  export const PaletteIcon: Icon;
  export const LogoutIcon: Icon;
  export const SunIcon: Icon;
  export const MoonIcon: Icon;
  export const RefreshIcon: Icon;
  export const PencilIcon: Icon;
  export const TrashIcon: Icon;
} 