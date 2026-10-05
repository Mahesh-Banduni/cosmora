"use client";

import * as React from "react";
import { useState, useContext, createContext, useRef, useEffect } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { createPortal } from "react-dom";

// Helper function to concatenate classnames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  menuItems: HTMLElement[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  registerMenuItem: (element: HTMLElement | null) => void;
  unregisterMenuItem: (element: HTMLElement | null) => void;
} | null>(null);

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("Dropdown subcomponents must be used within DropdownMenu");
  }
  return context;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  ...props
}: any) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const registerMenuItem = React.useCallback((element: HTMLElement | null) => {
    if (!element) return;
    setMenuItems((prev) => (prev.includes(element) ? prev : [...prev, element]));
  }, []);

  const unregisterMenuItem = React.useCallback((element: HTMLElement | null) => {
    if (!element) return;
    setMenuItems((prev) => prev.filter((item) => item !== element));
  }, []);

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }

    if (menuItems.length > 0) {
      setActiveIndex((current) => (current >= 0 && current < menuItems.length ? current : 0));
    }
  }, [open, menuItems.length]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isClickInsideTrigger = triggerRef.current?.contains(target);
      const isClickInsideContent = target.closest('[data-slot="dropdown-menu-content"]');
      const isClickInsideSubContent = target.closest('[data-slot="dropdown-menu-sub-content"]');

      if (!isClickInsideTrigger && !isClickInsideContent && !isClickInsideSubContent) {
        setOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        setOpen,
        triggerRef,
        menuItems,
        activeIndex,
        setActiveIndex,
        registerMenuItem,
        unregisterMenuItem,
      }}
    >
      <div className="relative inline-block text-left" {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, ...props }: any) {
  const { open, setOpen, triggerRef, setActiveIndex, menuItems } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(menuItems.length - 1);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(!open);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const child = React.isValidElement(children) ? (children as React.ReactElement<any>) : null;
  const childClassName = child?.props?.className as string | undefined;
  const className = cn("outline-none focus:outline-none", childClassName, props.className);

  if (child && typeof child.type === "string") {
    return React.cloneElement(child, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        if (child.props.onClick) child.props.onClick(e);
        handleClick(e);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (child.props.onKeyDown) child.props.onKeyDown(e);
        handleKeyDown(e);
      },
      "aria-haspopup": "true",
      "aria-expanded": open,
      "data-slot": "dropdown-menu-trigger",
      className,
      ...props,
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={open}
      data-slot="dropdown-menu-trigger"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuPortal({ children, ...props }: any) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

export function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  ...props
}: any) {
  const { open, triggerRef, setOpen, menuItems, activeIndex, setActiveIndex } = useDropdownMenu();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;

      // Force a reflow to ensure dimensions are calculated
      const contentHeight = content.scrollHeight || content.offsetHeight || 0;
      const contentWidth = content.scrollWidth || content.offsetWidth || 0;

      // If dimensions haven't been calculated yet, schedule another update
      if (contentHeight === 0 || contentWidth === 0) {
        requestAnimationFrame(updatePosition);
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const rootContainer = trigger.closest(".relative");
      const isInPortal = !rootContainer || !rootContainer.contains(content);

      // Calculate available space in each direction
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;

      const buffer = 10;

      // Check if there's enough space in each direction
      const hasSpaceBelow = spaceBelow >= contentHeight + buffer;
      const hasSpaceAbove = spaceAbove >= contentHeight + buffer;
      const hasSpaceRight = spaceRight >= contentWidth + buffer;
      const hasSpaceLeft = spaceLeft >= contentWidth + buffer;

      // Determine best vertical position (above or below)
      const verticalPosition =
        spaceBelow < contentHeight && spaceAbove > spaceBelow
          ? "top"
          : "bottom";

      // Determine best horizontal position (left, center, or right)
      let horizontalPosition = align; // respect user's align preference if it fits
      if (align === "end") {
        // Try to align to the right
        if (!hasSpaceRight && hasSpaceLeft) {
          horizontalPosition = "start"; // switch to left if right doesn't fit
        }
      } else if (align === "start") {
        // Try to align to the left
        if (!hasSpaceLeft && hasSpaceRight) {
          horizontalPosition = "end"; // switch to right if left doesn't fit
        }
      }

      if (isInPortal) {
        let left = rect.left + window.pageXOffset;
        let top =
          verticalPosition === "bottom"
            ? rect.bottom + window.pageYOffset + sideOffset
            : rect.top + window.pageYOffset - contentHeight - sideOffset;
      
        if (horizontalPosition === "center") {
          left =
            rect.left +
            window.pageXOffset +
            (rect.width - contentWidth) / 2;
        } else if (horizontalPosition === "end") {
          left =
            rect.right +
            window.pageXOffset -
            contentWidth;
        }
      
        const viewportTop = window.scrollY;
        const viewportBottom = viewportTop + window.innerHeight;
      
        if (top + contentHeight > viewportBottom - buffer) {
          top = viewportBottom - contentHeight - buffer;
        }
      
        if (top < viewportTop + buffer) {
          top = viewportTop + buffer;
        }
      
        // horizontal clamp
        if (left + contentWidth > window.innerWidth - buffer) {
          left = window.innerWidth - contentWidth - buffer;
        }
      
        if (left < buffer) {
          left = buffer;
        }
      
        // MISSING PART
        content.style.position = "absolute";
        content.style.left = `${left}px`;
        content.style.top = `${top}px`;
        content.style.transform = "";
      }
      else {
        if (verticalPosition === 'bottom') {
          content.style.top = "100%";
          content.style.marginTop = `${sideOffset}px`;
          content.style.bottom = "auto";
          content.style.marginBottom = "0";
        } else {
          content.style.bottom = "100%";
          content.style.marginBottom = `${sideOffset}px`;
          content.style.top = "auto";
          content.style.marginTop = "0";
        }

        if (horizontalPosition === "end") {
          content.style.right = "0";
          content.style.left = "auto";
          content.style.transform = "";
        } else if (horizontalPosition === "center") {
          content.style.left = "50%";
          content.style.transform = "translateX(-50%)";
          content.style.right = "auto";
        } else {
          content.style.left = "0";
          content.style.right = "auto";
          content.style.transform = "";
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const timeoutId = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(timeoutId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef]);

  useEffect(() => {
    if (!open) return;
    if (menuItems.length <= 0) return;

    const index = activeIndex >= 0 && activeIndex < menuItems.length ? activeIndex : 0;
    menuItems[index]?.focus();
  }, [open, activeIndex, menuItems]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!menuItems.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current: number) => Math.min(current + 1, menuItems.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current: number) => Math.max(current - 1, 0));
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(menuItems.length - 1);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < menuItems.length) {
        menuItems[activeIndex]?.click();
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "z-50 min-w-40 max-h-[350px] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--popover)] p-1 text-[13px] text-[var(--text-primary)] shadow-[var(--shadow-popover)] origin-top",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuGroup({ children, ...props }: any) {
  return (
    <div data-slot="dropdown-menu-group" role="group" className="py-1" {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  onClick,
  ...props
}: any) {
  const { setOpen, registerMenuItem, unregisterMenuItem, menuItems, activeIndex, setActiveIndex } = useDropdownMenu();
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerMenuItem(itemRef.current);
    return () => {
      unregisterMenuItem(itemRef.current);
    };
  }, [registerMenuItem, unregisterMenuItem]);

  const index = menuItems.findIndex((item) => item === itemRef.current);
  const isActive = index === activeIndex;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(event as any);
    }
  };

  return (
    <div
      ref={itemRef}
      role="menuitem"
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (index >= 0) {
          setActiveIndex(index);
        }
      }}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] leading-[1.4] outline-hidden select-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] focus:text-[var(--text-primary)] data-[variant=destructive]:text-[var(--danger)] data-[variant=destructive]:hover:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[var(--text-muted)] group-hover/dropdown-menu-item:[&_svg]:text-[var(--text-primary)]",
        isActive && "bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  inset,
  onClick,
  ...props
}: any) {
  const { setOpen, registerMenuItem, unregisterMenuItem, menuItems, activeIndex, setActiveIndex } = useDropdownMenu();
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerMenuItem(itemRef.current);
    return () => {
      unregisterMenuItem(itemRef.current);
    };
  }, [registerMenuItem, unregisterMenuItem]);

  const index = menuItems.findIndex((item) => item === itemRef.current);
  const isActive = index === activeIndex;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (onCheckedChange) onCheckedChange(!checked);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(event as any);
    }
  };

  return (
    <div
      ref={itemRef}
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (index >= 0) {
          setActiveIndex(index);
        }
      }}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] py-1.5 pr-8 pl-2.5 text-[13px] leading-[1.4] text-[var(--text-primary)] outline-hidden select-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] data-disabled:pointer-events-none data-disabled:opacity-50",
        isActive && "bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center h-4 w-4"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        {checked && <CheckIcon size={14} className="text-[var(--brand)]" />}
      </span>
      {children}
    </div>
  );
}

const RadioContext = createContext<{ value?: string; onValueChange?: (val: string) => void }>({});

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: any) {
  return (
    <RadioContext.Provider value={{ value, onValueChange }}>
      <div data-slot="dropdown-menu-radio-group" {...props}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  value: itemValue,
  inset,
  onClick,
  ...props
}: any) {
  const { value, onValueChange } = useContext(RadioContext);
  const { setOpen, registerMenuItem, unregisterMenuItem, menuItems, activeIndex, setActiveIndex } = useDropdownMenu();
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerMenuItem(itemRef.current);
    return () => {
      unregisterMenuItem(itemRef.current);
    };
  }, [registerMenuItem, unregisterMenuItem]);

  const checked = value === itemValue;
  const index = menuItems.findIndex((item) => item === itemRef.current);
  const isActive = index === activeIndex;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (onValueChange) onValueChange(itemValue);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(event as any);
    }
  };

  return (
    <div
      ref={itemRef}
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (index >= 0) {
          setActiveIndex(index);
        }
      }}
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] py-1.5 pr-8 pl-2.5 text-[13px] leading-[1.4] text-[var(--text-primary)] outline-hidden select-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] data-disabled:pointer-events-none data-disabled:opacity-50",
        isActive && "bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center h-4 w-4"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        {checked && <CheckIcon size={14} className="text-[var(--brand)]" />}
      </span>
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ className, inset, ...props }: any) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] data-inset:pl-7",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: any) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}

export function DropdownMenuShortcut({ className, ...props }: any) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  );
}

const DropdownMenuSubContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

export function DropdownMenuSub({ children, ...props }: any) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <DropdownMenuSubContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative w-full" ref={triggerRef} {...props}>
        {children}
      </div>
    </DropdownMenuSubContext.Provider>
  );
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: any) {
  const { open, setOpen } = useContext(DropdownMenuSubContext)!;

  const handleMouseEnter = () => setOpen(true);

  return (
    <div
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      onMouseEnter={handleMouseEnter}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] leading-[1.4] outline-hidden select-none hover:bg-[var(--surface-hover)] data-open:bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon size={14} className="ml-auto text-[var(--text-muted)]" />
    </div>
  );
}

export function DropdownMenuSubContent({
  className,
  children,
  ...props
}: any) {
  const { open, setOpen, triggerRef } =
    useContext(DropdownMenuSubContext)!;

  const [openLeft, setOpenLeft] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    const estimatedWidth = 180;

    setOpenLeft(
      window.innerWidth - rect.right < estimatedWidth
    );
  }, [open, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-sub-content"
      onMouseLeave={() => setOpen(false)}
      className={cn(
        "absolute top-0 z-50 min-w-40 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--popover)] p-1 text-[13px] text-[var(--text-primary)] shadow-[var(--shadow-popover)]",
        openLeft
          ? "right-full mr-1"
          : "left-full ml-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default function Dropdown({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: { label: string; onClick?: () => void }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="max-w-[200px]" align="end">
          {items.map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.onClick}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
