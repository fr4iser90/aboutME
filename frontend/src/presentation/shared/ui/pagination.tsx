import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants } from '@/presentation/shared/ui/button';

const navStyle: React.CSSProperties = {
  margin: '0 auto',
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
};

const Pagination = ({ className, style, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn(className)}
    style={{ ...navStyle, ...style }}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const ulStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.25rem',
};

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, style, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(className)}
    style={{ ...ulStyle, ...style }}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, style, ...props }, ref) => (
  <li ref={ref} className={cn(className)} style={style} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  style,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(className)}
    style={{ ...buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }).style, ...style }}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  style,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn(className)}
    style={{ gap: '0.25rem', paddingLeft: '0.625rem', ...style }}
    {...props}
  >
    <ChevronLeft style={{ height: '1rem', width: '1rem' }} />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  style,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn(className)}
    style={{ gap: '0.25rem', paddingRight: '0.625rem', ...style }}
    {...props}
  >
    <span>Next</span>
    <ChevronRight style={{ height: '1rem', width: '1rem' }} />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const ellipsisStyle: React.CSSProperties = {
  display: 'flex',
  height: '2.25rem',
  width: '2.25rem',
  alignItems: 'center',
  justifyContent: 'center',
};

const PaginationEllipsis = ({
  className,
  style,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(className)}
    style={{ ...ellipsisStyle, ...style }}
    {...props}
  >
    <MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
    <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
