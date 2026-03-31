import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  type?: "icon" | "text" | "both";
}

export function AppLogo({
  className,
  iconClassName,
  textClassName,
  type = "both",
}: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-10 h-10 text-sidebar-primary flex items-center justify-center",
          iconClassName,
        )}
      >
        <svg
          version="1.1"
          viewBox="0 0 1300 1300"
          width="325"
          height="325"
          className="w-10 h-10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            transform="translate(502,101)"
            d="m0 0h592l14 2 18 6 17 9 14 11 10 9 10 12 9 16 6 14 4 16 2 14 1 28v544l-1 21-4 22-7 21-8 15-10 13-11 12-7 8-10 9-273 273-11 9-12 9-16 9-14 5-11 3-16 2h-543l-15-2-17-6-19-10-13-10-17-17-10-15-8-17-4-14-2-10-1-11-1-24v-454l1-20 3-18 6-18 10-19 32-48 16-25 29-43 10-16 27-41 10-15 16-25 22-33 13-20 10-15 40-61 29-44 12-16 6-7h2l2-4 8-8 11-8 13-8 19-7 8-2zm165 132-32 1-1 2-1 145v140l1 126h208l1-41 1-89h126v-87h-58l-69 1 1-21h126l1-175-1-1-214-1z"
            fill="currentColor"
          />
        </svg>
      </div>
      {
        type !== "icon" && (
          <span
            className={cn(
              "font-semibold text-lg italic font-heading text-sidebar-foreground",
              textClassName,
            )}
          >
            FreelanceHub
          </span>
        )
      }
    </div>
  );
}
