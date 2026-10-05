"use client";

import * as React from "react";
import {
  useState,
  useContext,
  createContext,
  useRef,
  useEffect,
} from "react";
import {
  ChevronDownIcon,
  CheckIcon,
  ChevronUpIcon,
} from "lucide-react";
import { createPortal } from "react-dom";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type SelectOption = {
  value: string;
  label: string;
  ref: HTMLElement | null;
  id: string;
};

type SelectContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  placeholder?: string;
  setPlaceholder?: (text: string) => void;
  options: SelectOption[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  registerOption: (
    value: string,
    label: string,
    ref: HTMLElement | null,
    id: string
  ) => void;
  unregisterOption: (value: string) => void;
};

const SelectContext = createContext<SelectContextType | null>(null);

function useSelect() {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error(
      "Select subcomponents must be used within a Select provider"
    );
  }

  return context;
}

export function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  placeholder: initialPlaceholder,
  name,
  ...props
}: any) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue || ""
  );

  const [placeholder, setPlaceholder] = useState(
    initialPlaceholder || ""
  );

  const [options, setOptions] = useState<SelectOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const open =
    controlledOpen !== undefined
      ? controlledOpen
      : internalOpen;

  const setOpen = onOpenChange || setInternalOpen;

  const activeValue =
    value !== undefined ? String(value) : internalValue;

    // Native mirror of the selected value. Kept in the DOM (rather than
    // only in state) so that consumers which submit the surrounding form
    // synchronously from onValueChange read the fresh value.
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    const handleValueChange = (val: string) => {
      setInternalValue(val);

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = val;
      }

      onValueChange?.(val);
    };

  const registerOption = React.useCallback(
    (
      val: string,
      label: string,
      ref: HTMLElement | null,
      id: string
    ) => {
      setOptions((prev) => {
        const existingIndex = prev.findIndex(
          (option) => option.value === val
        );

        const next = [...prev];

        const option = {
          value: String(val),
          label,
          ref,
          id,
        };

        if (existingIndex !== -1) {
          next[existingIndex] = option;
        } else {
          next.push(option);
        }

        return next;
      });
    },
    []
  );

  const unregisterOption = React.useCallback((val: string) => {
    setOptions((prev) =>
      prev.filter(
        (option) => option.value !== String(val)
      )
    );
  }, []);

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = options.findIndex(
      (option) => option.value === activeValue
    );

    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : 0
    );
  }, [open, activeValue, options]);

  useEffect(() => {
    if (
      !open ||
      activeIndex < 0 ||
      activeIndex >= options.length
    ) {
      return;
    }

    const activeOption = options[activeIndex];

    if (!activeOption?.ref) {
      return;
    }

    activeOption.ref.focus();
    activeOption.ref.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex, options]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const isClickInsideTrigger =
        triggerRef.current?.contains(target);

      const isClickInsideContent =
        target.closest(
          '[data-slot="select-content"]'
        );

      if (
        !isClickInsideTrigger &&
        !isClickInsideContent
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open, setOpen]);

  return (
    <SelectContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        triggerRef,
        placeholder,
        setPlaceholder,
        options,
        activeIndex,
        setActiveIndex,
        registerOption,
        unregisterOption,
      }}
    >
      <div
        className="relative inline-block w-full text-left"
        {...props}
      >
        {/*
          Native mirror so the Select participates in native form
          submission (FormData / server actions) exactly like the
          <select> it replaces.
        */}
        {name ? (
          <input
                    ref={hiddenInputRef}
                    type="hidden"
                    name={name}
                    value={activeValue ?? ""}
                  />
                ) : null}

        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectGroup({
  className,
  ...props
}: any) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

export function SelectValue({
  placeholder: propPlaceholder,
  ...props
}: any) {
  const {
    value,
    options,
    placeholder: contextPlaceholder,
  } = useSelect();

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const displayPlaceholder =
    propPlaceholder ||
    contextPlaceholder ||
    "Select...";

  return (
    <span
      data-slot="select-value"
      {...props}
    >
      {selectedOption?.label ?? displayPlaceholder}
    </span>
  );
}

export function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: any) {
  const {
    open,
    setOpen,
    triggerRef,
    setActiveIndex,
    options,
  } = useSelect();

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(
        Math.max(options.length - 1, 0)
      );
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(!open);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      data-slot="select-trigger"
      data-size={size}
      onClick={() => setOpen(!open)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--surface)] px-scale-sm-3! h-scale-sm-10! text-[14px] leading-[1.45] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 outline-none select-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)] hover:border-[color-mix(in_srgb,var(--input)_100%,var(--text-muted)_40%)] disabled:cursor-not-allowed disabled:opacity-60 data-[size=sm]:h-8 cursor-pointer text-left text-[var(--text-primary)] aria-[invalid=true]:border-[var(--destructive)]",
        className
      )}
      {...props}
    >
      {children}

      <ChevronDownIcon className="pointer-events-none size-4 text-[var(--text-muted)]" />
    </button>
  );
}

export function SelectPortal({
  children,
}: any) {
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    children,
    document.body
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: any) {
  const {
    open,
    triggerRef,
    options,
    activeIndex,
    setActiveIndex,
    setOpen,
  } = useSelect();

  const contentRef =
    useRef<HTMLDivElement | null>(null);

  const [hasScroll, setHasScroll] =
    useState(false);

  useEffect(() => {
    if (
      !open ||
      !triggerRef.current ||
      !contentRef.current
    ) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const content = contentRef.current;

      if (!trigger || !content) {
        return;
      }

      const rect =
        trigger.getBoundingClientRect();

      const rootContainer =
        trigger.closest(".relative");

      const isInPortal =
        !rootContainer ||
        !rootContainer.contains(content);

      if (isInPortal) {
        let left =
          rect.left + window.pageXOffset;

        const top =
          rect.bottom +
          window.pageYOffset +
          sideOffset;

        if (align === "center") {
          left =
            rect.left +
            window.pageXOffset +
            (rect.width -
              content.offsetWidth) /
              2;
        } else if (align === "end") {
          left =
            rect.right +
            window.pageXOffset -
            content.offsetWidth;
        }

        if (position === "popper") {
          content.style.width =
            `${rect.width}px`;
        }

        const screenWidth =
          window.innerWidth;

        if (
          left + content.offsetWidth >
          screenWidth
        ) {
          left =
            screenWidth -
            content.offsetWidth -
            10;
        }

        if (left < 10) {
          left = 10;
        }

        content.style.position =
          "absolute";

        content.style.top =
          `${top}px`;

        content.style.left =
          `${left}px`;
      } else {
        content.style.position =
          "absolute";

        content.style.top = "100%";

        content.style.marginTop =
          `${sideOffset}px`;

        if (position === "popper") {
          content.style.width = "100%";
        }

        if (align === "end") {
          content.style.right = "0";
          content.style.left = "auto";
        } else if (align === "center") {
          content.style.left = "50%";
          content.style.transform =
            "translateX(-50%)";
        } else {
          content.style.left = "0";
          content.style.right = "auto";
        }
      }

      setHasScroll(
        content.scrollHeight >
          content.clientHeight
      );
    };

    updatePosition();

    window.addEventListener(
      "resize",
      updatePosition
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
    };
  }, [
    open,
    align,
    sideOffset,
    position,
  ]);

  useEffect(() => {
    if (!open || !contentRef.current) {
      return;
    }

    const checkScroll = () => {
      const content =
        contentRef.current;

      if (!content) {
        return;
      }

      setHasScroll(
        content.scrollHeight >
          content.clientHeight
      );
    };

    const observer =
      new ResizeObserver(checkScroll);

    observer.observe(
      contentRef.current
    );

    return () => {
      observer.disconnect();
    };
  }, [open]);

  const activeOption =
    options[activeIndex];

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!options.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex(
        (current: number) =>
          (current + 1) %
          options.length
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex(
        (current: number) =>
          (current - 1 +
            options.length) %
          options.length
      );
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();

      setActiveIndex(
        options.length - 1
      );
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (activeOption?.ref) {
        activeOption.ref.click();
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setOpen(false);

      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      role="listbox"
      tabIndex={open ? 0 : -1}
      aria-hidden={!open}
      className={cn(
        "z-50 min-w-40 max-h-[280px] overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--popover)] p-1 text-[13px] text-[var(--text-primary)] shadow-[var(--shadow-popover)] origin-top",
        !open && "hidden",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {hasScroll && (
        <SelectScrollUpButton />
      )}

      <div>{children}</div>

      {hasScroll && (
        <SelectScrollDownButton />
      )}
    </div>
  );
}

export function SelectItem({
  className,
  children,
  value: itemValue,
  ...props
}: any) {
  const {
    value,
    onValueChange,
    setOpen,
    registerOption,
    unregisterOption,
    options,
    setActiveIndex,
  } = useSelect();

  const normalizedValue =
    String(itemValue);

  const itemRef =
    useRef<HTMLDivElement | null>(null);

  const idRef = useRef<string>(
    `select-item-${normalizedValue}-${Math.random()
      .toString(36)
      .slice(2)}`
  );

  const isSelected =
    value === normalizedValue;

  const index =
    options.findIndex(
      (option) =>
        option.value === normalizedValue
    );

  const labelText =
    typeof children === "string"
      ? children
      : String(children ?? "");

  useEffect(() => {
    registerOption(
      normalizedValue,
      labelText || normalizedValue,
      itemRef.current,
      idRef.current
    );

    return () => {
      unregisterOption(normalizedValue);
    };
  }, [
    normalizedValue,
    labelText,
    registerOption,
    unregisterOption,
  ]);

  const handleSelect = (
    event:
      | React.MouseEvent
      | React.KeyboardEvent
  ) => {
    event.preventDefault();

    onValueChange?.(normalizedValue);

    setOpen(false);
  };

  const handlePointerMove = () => {
    if (index >= 0) {
      setActiveIndex(index);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleSelect(event);
    }
  };

  return (
    <div
      ref={itemRef}
      id={idRef.current}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={handleSelect}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] leading-[1.4] text-[var(--text-primary)] outline-hidden select-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span>{children}</span>

      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        {isSelected && (
          <CheckIcon
            size={14}
            className="text-[var(--brand)] pointer-events-none"
          />
        )}
      </span>
    </div>
  );
}

export function SelectLabel({
  className,
  ...props
}: any) {
  return (
    <div
      data-slot="select-label"
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  );
}

export function SelectSeparator({
  className,
  ...props
}: any) {
  return (
    <div
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}

export function SelectScrollUpButton({
  className,
  ...props
}: any) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-[var(--background)] py-1 text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      <ChevronUpIcon size={14} />
    </div>
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: any) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-[var(--background)] py-1 text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      <ChevronDownIcon size={14} />
    </div>
  );
}

interface Option {
  label: string;
  value: string;
}

interface DefaultSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function DefaultSelect({
  options,
  value,
  onChange,
}: DefaultSelectProps) {
  const selectedOption = options.find(
    (item) => item.value === value
  );

  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={selectedOption?.label}
        />
      </SelectTrigger>

      <SelectContent>
        {options.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}