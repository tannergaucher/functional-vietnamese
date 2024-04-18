import Image from "next/image";

export function Card({
  size,
  image,
  small,
  heading,
  subHeading,
  children,
}: {
  size: "small" | "medium" | "large";
  image?: { src: string; alt: string; width: number; height: number };
  small?: string;
  heading: string;
  subHeading?: string;
  children?: React.ReactNode;
}) {
  const fonts = {
    small: {
      small: "text-xs",
      heading: "text-lg",
      subHeading: "text-sm",
    },
    medium: {
      small: "text-sm",
      heading: "text-xl",
      subHeading: "text-base",
    },
    large: {
      small: "text-base",
      heading: "text-3xl",
      subHeading: "text-xl",
    },
  };

  const marginY = {
    small: "my-1",
    medium: "my-2",
    large: "my-6",
  };

  return (
    <div className="border border-bg-1-light dark:border-accent-1-dark dark:hover:border-accent-1-dark rounded-lg p-3 box-border shadow-lg h-auto">
      {image ? (
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          className="rounded-lg shadow-lg mb-3"
        />
      ) : null}
      {small ? (
        <small
          className={`${fonts[size].small} block ${marginY[size]} text-gray-600 dark:text-gray-300`}
        >
          {small}
        </small>
      ) : null}

      <h2 className={`${fonts[size].heading} ${marginY[size]}  font-semibold`}>
        {heading}
      </h2>
      {subHeading ? (
        <p
          className={`${fonts[size].subHeading} ${marginY[size]} text-gray-600 dark:text-gray-300`}
        >
          {subHeading}
        </p>
      ) : null}
      {children}
    </div>
  );
}
