"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const Calendar = React.memo(({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        // react-day-picker v10 renombró `caption` a `month_caption`, que ahora
        // contiene tanto la etiqueta del mes como la barra de navegación.
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        // v10 dividió `nav_button` en dos elementos independientes.
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        // v10 sustituyó la tabla `<table>` por `month_grid` y renombró cada capa.
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        weeks: "flex w-full mt-2",
        // El `cell` de v8 es el contenedor `day` en v10; el `day` de v8 (el botón)
        // pasó a llamarse `day_button`.
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        // v10 quitó el prefijo `day_` de los estados. Los valores conservan las
        // clases literales (`day-range-end`, `day-outside`) porque los selectores
        // `:has([aria-selected].…)` de arriba las necesitan para coincidir.
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // v10 reemplazó `IconLeft` / `IconRight` por un único `Chevron` que recibe
        // `orientation`. `size` lo consume Lucide; `disabled` no es un atributo
        // SVG válido, así que se descarta antes de extender las props.
        Chevron: ({ orientation, size, disabled: _disabled, ...props }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "down"
                  ? ChevronDown
                  : ChevronUp
          return <Icon className="h-4 w-4" size={size} {...props} />
        },
      }}
      {...props}
    />
  )
})
Calendar.displayName = "Calendar"

export { Calendar }
